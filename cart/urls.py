from django.urls import path
from .views import CartListAPIView, CartAddUpdateAPIView, CartDeleteAPIView

urlpatterns = [
    path('', CartListAPIView.as_view(), name='cart_list'),
    path('add/', CartAddUpdateAPIView.as_view(), name='cart_add'),
    path('delete/<int:id>/', CartDeleteAPIView.as_view(), name='cart_delete'),
]