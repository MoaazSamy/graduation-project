from django.db import models
from django.contrib.auth.models import User
from products.models import Product


# موديل Reviews مسؤول عن تخزين تقييمات وتعليقات المستخدمين على المنتجات
class Review(models.Model):

    # المستخدم اللي كتب التقييم
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews'
    )

    # المنتج اللي اتكتب عليه التقييم
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews'
    )

    # تقييم المنتج (من 1 إلى 5)
    rating = models.PositiveSmallIntegerField()

    # تعليق المستخدم على المنتج
    comment = models.TextField(blank=True)

    # تاريخ ووقت إضافة التقييم
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # منع المستخدم من كتابة أكثر من Review لنفس المنتج
        unique_together = ['user', 'product']

    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.rating})"
