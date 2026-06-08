from rest_framework import serializers
from .models import Review


# Serializer مسؤول عن تحويل بيانات Review إلى JSON
class ReviewSerializer(serializers.ModelSerializer):

    # اسم المستخدم للعرض فقط
    user_name = serializers.CharField(
        source='user.username',
        read_only=True
    )

    class Meta:
        model = Review
        fields = [
            'id',
            'product',
            'user_name',
            'rating',
            'comment',
            'created_at'
        ]
