from django.urls import path
from .views import (
    CheckoutAPIView, OrderListAPIView, UserOrdersListAPIView,
    UserOrderDetailAPIView, OrderStatusUpdateAPIView, AdminOrdersListAPIView,
    UserCancelOrderAPIView, ValidateCouponAPIView, CouponListCreateAPIView, CouponRetrieveUpdateDestroyAPIView
)

urlpatterns = [
    path('checkout/', CheckoutAPIView.as_view(), name='checkout'),
    path('', OrderListAPIView.as_view(), name='order_list'),
    path('my-orders/', UserOrdersListAPIView.as_view()),
    path('<int:id>/', UserOrderDetailAPIView.as_view()),
    path('status/<int:id>/', OrderStatusUpdateAPIView.as_view()),
    path('admin/all/', AdminOrdersListAPIView.as_view()),
    path('<int:id>/cancel/', UserCancelOrderAPIView.as_view(), name='user_cancel_order'),
    path('apply-coupon/', ValidateCouponAPIView.as_view(), name='apply_coupon'),
    path('admin/coupons/', CouponListCreateAPIView.as_view(), name='admin_coupons'),
    path('admin/coupons/<int:id>/', CouponRetrieveUpdateDestroyAPIView.as_view(), name='admin_coupon_detail'),
]