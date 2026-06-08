from django.db import models
from django.contrib.auth.models import User
from products.models import Product


# موديل Wishlist مسؤول عن تخزين المنتجات اللي المستخدم ضافها للمفضلة
class Wishlist(models.Model):

    # ربط المفضلة بالمستخدم
    # كل مستخدم ممكن يكون عنده أكتر من منتج في الـ wishlist
    # لو المستخدم اتحذف، كل المفضلة بتاعته تتحذف تلقائي
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='wishlist'
    )

    # ربط المفضلة بالمنتج
    # كل سجل Wishlist بيشير لمنتج واحد
    # لو المنتج اتحذف، السجل ده يتحذف تلقائي
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    # تاريخ ووقت إضافة المنتج للمفضلة
    # بيتسجل تلقائي أول ما السجل يتعمل
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # منع تكرار نفس المنتج لنفس المستخدم أكتر من مرة
        # يعني المستخدم ما ينفعش يضيف نفس المنتج مرتين في الـ wishlist
        unique_together = ['user', 'product']

    def __str__(self):
        # الشكل اللي هيظهر في Django Admin
        return f"{self.user.username} - {self.product.name}"
