from django.shortcuts import render, redirect

# Create your views here.
import os
from rest_framework import generics, status
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserProfileSerializer, ChangePasswordSerializer
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken

class UserRegisterAPIView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer

class UserLoginAPIView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)

class UserProfileAPIView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # نرجع المستخدم الحالي فقط
        return self.request.user

class ChangePasswordAPIView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        # تحديث كلمة المرور
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({"detail": "تم تغيير كلمة المرور بنجاح"}, status=status.HTTP_200_OK)



    # ------------------- Social Auth -------------------
def social_auth_complete(request):
        """
        بعد ما OAuth ينتهي، بيجي هنا ويرجع JWT للفرونت اند
        """
        user = request.user
        if user.is_authenticated:
            refresh = RefreshToken.for_user(user)
            tokens = {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
            frontend_url = os.environ.get(
                'FRONTEND_URL',
                'http://127.0.0.1:5500/frontend/login.html'
            )
            # بنبعت التوكنز + بيانات المستخدم في الـ URL
            from urllib.parse import urlencode
            params = urlencode({
                'access': tokens['access'],
                'refresh': tokens['refresh'],
                'user_id': user.id,
                'user_name': user.username,
                'user_email': user.email or '',
                'is_admin': 'true' if (user.is_superuser or user.is_staff) else 'false',
                'is_premium': 'true' if getattr(user, 'profile', None) and user.profile.is_premium else 'false',
            })
            return redirect(f"{frontend_url}?{params}")
        return JsonResponse({'error': 'Authentication failed'}, status=400)

from django.contrib.auth.models import User
from .serializers import AdminUserSerializer

class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]

class AdminTogglePremiumView(generics.UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAdminUser]
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        profile = getattr(user, 'profile', None)
        if not profile:
            from .models import UserProfile
            profile = UserProfile.objects.create(user=user)
        
        new_status = request.data.get('is_premium', False)
        profile.is_premium = new_status
        profile.save()
        return Response({"detail": "تم تحديث حالة العميل المميز", "is_premium": new_status})
    