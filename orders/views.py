from rest_framework import generics,status
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from .serializers import CheckoutSerializer, OrderSerializer,OrderStatusSerializer
from .models import Order
from rest_framework.response import Response
from notifications.utils import notify_admins, notify_order_status_change

class CheckoutAPIView(generics.CreateAPIView):
    serializer_class = CheckoutSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = serializer.save()  # هذا يرجع كائن Order

        # 🔔 إشعار لكل الأدمنز بوجود طلب جديد
        notify_admins(
            title=f'طلب جديد #{order.id}',
            message=f'طلب جديد من {order.user.username} بقيمة {order.total_price} ج.م',
            notification_type='order_created',
            related_order=order
        )

        # نحوله إلى JSON باستخدام OrderSerializer
        output_serializer = OrderSerializer(order)

        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class OrderListAPIView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class UserOrdersListAPIView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(
            user=self.request.user
        ).order_by('-created_at')

class UserOrderDetailAPIView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class OrderStatusUpdateAPIView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderStatusSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'id'

    def perform_update(self, serializer):
        # حفظ الحالة القديمة قبل التحديث
        order = self.get_object()
        old_status = order.status
        
        # تنفيذ التحديث
        updated_order = serializer.save()
        new_status = updated_order.status
        
        # 🔔 إشعار المستخدم بتغيير حالة طلبه
        if old_status != new_status:
            notify_order_status_change(updated_order, old_status, new_status)

class AdminOrdersListAPIView(generics.ListAPIView):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]

from rest_framework.views import APIView

class UserCancelOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        try:
            order = Order.objects.get(id=id, user=request.user)
            if order.status not in ['pending', 'processing']:
                return Response({'detail': 'لا يمكن إلغاء هذا الطلب في هذه المرحلة.'}, status=status.HTTP_400_BAD_REQUEST)
            
            old_status = order.status
            order.status = 'cancelled'
            order.save()

            notify_admins(
                title=f'إلغاء طلب #{order.id}',
                message=f'قام المستخدم {order.user.username} بإلغاء طلبه.',
                notification_type='order_cancelled',
                related_order=order
            )

            return Response({'detail': 'تم إلغاء الطلب بنجاح', 'status': order.status}, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({'detail': 'الطلب غير موجود.'}, status=status.HTTP_404_NOT_FOUND)

from django.utils import timezone
from .models import Coupon
from .serializers import CouponSerializer

class ValidateCouponAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code', '').strip()
        try:
            coupon = Coupon.objects.get(code__iexact=code, active=True)
            if coupon.valid_until and coupon.valid_until < timezone.now():
                return Response({'detail': 'عذراً، هذا الكوبون منتهي الصلاحية.'}, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                'detail': 'تم تطبيق الكوبون بنجاح!',
                'discount_percent': coupon.discount_percent,
                'code': coupon.code
            }, status=status.HTTP_200_OK)
        except Coupon.DoesNotExist:
            return Response({'detail': 'كوبون غير صالح أو منتهي الصلاحية.'}, status=status.HTTP_400_BAD_REQUEST)

class CouponListCreateAPIView(generics.ListCreateAPIView):
    queryset = Coupon.objects.all().order_by('-created_at')
    serializer_class = CouponSerializer
    permission_classes = [IsAdminUser]

class CouponRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'id'