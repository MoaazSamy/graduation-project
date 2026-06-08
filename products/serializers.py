# jsonلفايل دا هو اللي هيتعامل كوسيط بين object و

from rest_framework import serializers
from .models import Product, Category, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'url']

    def get_url(self, obj):
        request = self.context.get('request', None)
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return ""


class ProductSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    gallery = ProductImageSerializer(source='images', many=True, read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

    def get_image(self, obj):
        request = self.context.get('request', None)
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products with image upload"""
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'original_price', 'discount_percent',
                  'stock', 'category', 'image', 'created_at',
                  'screen', 'processor', 'camera', 'battery', 'ram', 'storage', 'storage_options', 'os',
                  'product_type', 'accessory_type', 'is_latest']
        read_only_fields = ['id', 'created_at']