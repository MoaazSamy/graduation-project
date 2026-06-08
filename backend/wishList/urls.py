from django.urls import path
from .views import (
    AddToWishlistView,
    RemoveFromWishlistView,
    WishlistListView
)

# تعريف المسارات الخاصة بالمفضلة
urlpatterns = [

    # مسار إضافة منتج إلى المفضلة (POST)
    path('add/', AddToWishlistView.as_view()),

    # مسار حذف منتج من المفضلة (DELETE)
    path('remove/', RemoveFromWishlistView.as_view()),

    # مسار عرض جميع المنتجات في المفضلة (GET)
    path('', WishlistListView.as_view()),
]
