from rest_framework import serializers
from .models import Order, OrderItem, Coupon
from products.serializers import ProductSerializer
from cart.models import CartItem
from django.db import transaction

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price']

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'user', 'user_name', 'shipping_name', 'shipping_phone', 'shipping_address', 'total_price', 'status', 'created_at', 'items']

    def get_user_name(self, obj):
        return obj.user.username if obj.user else ''


# class CheckoutSerializer(serializers.Serializer):
#     # لا نحتاج fields من Model مباشرة لأننا نحول Cart -> Order
#     def create(self, validated_data):
#         user = self.context['request'].user
#         cart_items = CartItem.objects.filter(user=user)
#         if not cart_items.exists():
#             raise serializers.ValidationError("السلة فارغة!")
#
#         total_price = sum(item.product.price * item.quantity for item in cart_items)
#         order = Order.objects.create(user=user, total_price=total_price)
#
#         for item in cart_items:
#             OrderItem.objects.create(
#                 order=order,
#                 product=item.product,
#                 quantity=item.quantity,
#                 price=item.product.price
#             )
#             # تقليل المخزون
#             item.product.stock -= item.quantity
#             item.product.save()
#
#         # بعد إنشاء الطلب، مسح السلة
#         cart_items.delete()
#
#         return order
class CheckoutSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    coupon_code = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        user = self.context['request'].user
        cart_items = CartItem.objects.select_related('product').filter(user=user)

        if not cart_items.exists():
            raise serializers.ValidationError("السلة فارغة!")

        coupon_code = validated_data.get('coupon_code', '')
        discount_percent = 0
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code__iexact=coupon_code, active=True)
                discount_percent = coupon.discount_percent
            except Coupon.DoesNotExist:
                pass

        with transaction.atomic():
            total_price = 0
            order = Order.objects.create(
                user=user, 
                total_price=0,
                shipping_name=validated_data.get('name', ''),
                shipping_phone=validated_data.get('phone', ''),
                shipping_address=validated_data.get('address', '')
            )

            for item in cart_items:
                product = item.product

                # ✅ تحقق من المخزون
                if product.stock < item.quantity:
                    raise serializers.ValidationError(
                        f"الكمية غير متاحة للمنتج: {product.name}"
                    )

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item.quantity,
                    price=product.price
                )

                # تقليل المخزون
                product.stock -= item.quantity
                product.save()

                total_price += product.price * item.quantity

            if discount_percent > 0:
                total_price = total_price * (100 - discount_percent) / 100

            order.total_price = total_price
            order.save()

            # مسح السلة
            cart_items.delete()

        return order

class OrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status']