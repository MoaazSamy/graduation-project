from django.urls import path
from .views import ProductListAPIView, ProductDetailAPIView, ProductListCreateAPIView, ProductRetrieveUpdateDestroyAPIView, CategoryListAPIView, ProductImageDestroyAPIView

urlpatterns = [
    path('', ProductListAPIView.as_view(), name='product-list'),
    path('<int:id>/', ProductDetailAPIView.as_view(), name='product-detail'),
    path('manage/', ProductListCreateAPIView.as_view()),
    path('manage/<int:id>/', ProductRetrieveUpdateDestroyAPIView.as_view()),
    path('categories/', CategoryListAPIView.as_view(), name='category-list'),
    path('manage/image/<int:id>/', ProductImageDestroyAPIView.as_view()),
]



