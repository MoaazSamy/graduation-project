from django.shortcuts import render
from django.db.models import Q
# Create your views here.
from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Product, Category, ProductImage
from .serializers import ProductSerializer, ProductCreateSerializer, CategorySerializer
from rest_framework.permissions import IsAdminUser, AllowAny

class ProductListCreateAPIView(generics.ListCreateAPIView):
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateSerializer
        return ProductSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = Product.objects.all()
        category = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)
        product_type = self.request.query_params.get('product_type', None)
        accessory_type = self.request.query_params.get('accessory_type', None)
        
        if category:
            queryset = queryset.filter(category__name__iexact=category)
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(description__icontains=search))
        if product_type:
            queryset = queryset.filter(product_type=product_type)
        if accessory_type:
            queryset = queryset.filter(accessory_type=accessory_type)
            
        is_latest = self.request.query_params.get('is_latest', None)
        if is_latest and is_latest.lower() == 'true':
            queryset = queryset.filter(is_latest=True)
            
        return queryset
    
    def perform_create(self, serializer):
        product = serializer.save()
        gallery_images = self.request.FILES.getlist('gallery')
        for img in gallery_images:
            ProductImage.objects.create(product=product, image=img)

    def get_serializer_context(self):
        return {'request': self.request}

class ProductListAPIView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    pagination_class = None  # Return all products without pagination

    def get_queryset(self):
        queryset = Product.objects.all()
        category = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)
        product_type = self.request.query_params.get('product_type', None)
        accessory_type = self.request.query_params.get('accessory_type', None)
        
        if category:
            queryset = queryset.filter(category__name__iexact=category)
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(description__icontains=search))
        if product_type:
            queryset = queryset.filter(product_type=product_type)
        if accessory_type:
            queryset = queryset.filter(accessory_type=accessory_type)
            
        is_latest = self.request.query_params.get('is_latest', None)
        if is_latest and is_latest.lower() == 'true':
            queryset = queryset.filter(is_latest=True)
            
        return queryset
    

    def get_serializer_context(self):
        return {'request': self.request}

class ProductDetailAPIView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'id'
    permission_classes = [AllowAny]

    def get_serializer_context(self):
        return {'request': self.request}


class ProductRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    lookup_field = 'id'
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProductCreateSerializer
        return ProductSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUser()]
        return [AllowAny()]

    def perform_update(self, serializer):
        product = serializer.save()
        gallery_images = self.request.FILES.getlist('gallery')
        for img in gallery_images:
            ProductImage.objects.create(product=product, image=img)

    def get_serializer_context(self):
        return {'request': self.request}


class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None

class ProductImageDestroyAPIView(generics.DestroyAPIView):
    queryset = ProductImage.objects.all()
    permission_classes = [IsAdminUser]
    lookup_field = 'id'
