from django.db import models

# Create your models here.
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Product(models.Model):
    PRODUCT_TYPE_CHOICES = [
        ('phone', 'Phone'),
        ('accessory', 'Accessory'),
    ]
    ACCESSORY_TYPE_CHOICES = [
        ('airpods', 'AirPods'),
        ('covers', 'Covers'),
        ('chargers', 'Chargers'),
    ]

    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # السعر قبل الخصم
    discount_percent = models.IntegerField(default=0)  # نسبة الخصم (0 = لا يوجد خصم)
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_latest = models.BooleanField(default=False)

    # Product type
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPE_CHOICES, default='phone')
    accessory_type = models.CharField(max_length=20, choices=ACCESSORY_TYPE_CHOICES, blank=True, null=True)

    # Technical Specifications (optional - mainly for phones)
    screen = models.CharField(max_length=200, blank=True, null=True)       # e.g. "6.7 بوصة Super AMOLED"
    processor = models.CharField(max_length=200, blank=True, null=True)    # e.g. "Snapdragon 8 Gen 3"
    camera = models.CharField(max_length=200, blank=True, null=True)       # e.g. "200MP + 12MP + 50MP"
    battery = models.CharField(max_length=100, blank=True, null=True)      # e.g. "5000 mAh"
    ram = models.CharField(max_length=50, blank=True, null=True)           # e.g. "12GB"
    storage = models.CharField(max_length=50, blank=True, null=True)       # e.g. "256GB" (Default/Primary storage)
    storage_options = models.JSONField(default=list, blank=True)           # e.g. [{"storage": "128GB", "price": 15000}, {"storage": "256GB", "price": 18000}]
    os = models.CharField(max_length=100, blank=True, null=True)           # e.g. "Android 14"


    def __str__(self):
        return self.name
    
    def get_image_url(self):
        if self.image:
            return self.image.url
        return ""


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/gallery/')

    def __str__(self):
        return f"Image for {self.product.name}"
    
    def get_image_url(self):
        if self.image:
            return self.image.url
        return ""

    
from django.contrib.auth.models import User


class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"Cart - {self.user.username}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="cart_items")
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"