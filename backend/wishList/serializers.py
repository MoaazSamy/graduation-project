from rest_framework import serializers
from .models import Wishlist
from products.models import Product


# Serializer مسؤول عن تحويل بيانات Wishlist من Object إلى JSON
class WishlistSerializer(serializers.ModelSerializer):

    # إرجاع اسم المنتج المرتبط بسجل المفضلة
    # الحقل ده للعرض فقط ومش بيتخزن في جدول Wishlist
    product_name = serializers.CharField(
        source='product.name',
        read_only=True
    )

    # إرجاع سعر المنتج المرتبط بسجل المفضلة
    # بنحدد عدد الخانات العشرية وطول الرقم
    product_price = serializers.DecimalField(
        source='product.price',
        max_digits=12,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        # ربط الـ serializer بموديل Wishlist
        model = Wishlist

        # الحقول اللي هتظهر في الـ API
        fields = [
            'id',
            'product',
            'product_name',
            'product_price',
            'created_at'
        ]
