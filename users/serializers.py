from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)
    user_id = serializers.IntegerField(read_only=True)
    user_email = serializers.CharField(read_only=True)
    user_name = serializers.CharField(read_only=True)
    is_admin = serializers.BooleanField(read_only=True)
    is_premium = serializers.BooleanField(read_only=True)

    def validate(self, data):
        print("===== NEW VERSION =====")
        
        username = data.get('username')
        password = data.get('password')

        print("USERNAME:", username)
        print("PASSWORD:", password)

        try:
            user = authenticate(username=username, password=password)
            print("USER =", user)
        except Exception as e:
            print("AUTH ERROR =", str(e))
            raise

        if user:
            print("USER ID =", user.id)

        if not user:
            raise serializers.ValidationError(
                "اسم المستخدم أو كلمة المرور غير صحيحة"
            )

        refresh = RefreshToken.for_user(user)
        data['access'] = str(refresh.access_token)
        data['refresh'] = str(refresh)
        data['user_id'] = user.id
        data['user_email'] = user.email
        data['user_name'] = user.username
        data['is_admin'] = user.is_superuser or user.is_staff
        data['is_premium'] = getattr(user, 'profile', None) and user.profile.is_premium

        return data

class UserProfileSerializer(serializers.ModelSerializer):
    is_premium = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_premium']

    def get_is_premium(self, obj):
        return getattr(obj, 'profile', None) and obj.profile.is_premium

class AdminUserSerializer(serializers.ModelSerializer):
    is_premium = serializers.SerializerMethodField()
    date_joined = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined', 'is_premium', 'is_staff']

    def get_is_premium(self, obj):
        return getattr(obj, 'profile', None) and obj.profile.is_premium

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("كلمة المرور القديمة غير صحيحة")
        return value

    def validate_new_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
        return value