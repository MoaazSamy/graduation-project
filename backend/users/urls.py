from django.urls import path
from .views import (
    UserRegisterAPIView, UserLoginAPIView, UserProfileAPIView, 
    ChangePasswordAPIView, social_auth_complete,
    AdminUserListView, AdminTogglePremiumView
)

urlpatterns = [
    path('register/', UserRegisterAPIView.as_view(), name='register'),
    path('login/', UserLoginAPIView.as_view(), name='login'),
    path('profile/', UserProfileAPIView.as_view(), name='profile'),
    path('change-password/', ChangePasswordAPIView.as_view(), name='change_password'),
    path('social/complete/', social_auth_complete, name='social-complete'),
    
    # Admin routes
    path('admin/all/', AdminUserListView.as_view(), name='admin_users'),
    path('admin/<int:id>/toggle-premium/', AdminTogglePremiumView.as_view(), name='admin_toggle_premium'),
]