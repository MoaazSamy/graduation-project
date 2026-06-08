from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import WishlistSerializer
from products.models import Product
from .models import Wishlist


# View مسؤولة عن إضافة منتج إلى المفضلة
class AddToWishlistView(APIView):

    # السماح فقط للمستخدمين المسجلين
    permission_classes = [IsAuthenticated]

    # تنفيذ الكود عند استقبال طلب POST
    def post(self, request):

        # استلام رقم المنتج من البيانات المرسلة في الطلب
        product_id = request.data.get('product')

        # التأكد إن المنتج موجود في قاعدة البيانات
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            # لو المنتج غير موجود نرجع رسالة خطأ
            return Response(
                {'error': 'Product not found'},
                status=404
            )

        # إضافة المنتج للمفضلة أو تجاهل الإضافة لو كان موجود بالفعل
        wishlist_item, created = Wishlist.objects.get_or_create(
            user=request.user,
            product=product
        )

        # في حالة إن المنتج موجود بالفعل في المفضلة
        if not created:
            return Response(
                {'message': 'Already in wishlist'},
                status=200
            )

        # في حالة إضافة المنتج بنجاح
        return Response(
            {'message': 'Added to wishlist'},
            status=201
        )

# View مسؤولة عن حذف منتج من المفضلة
class RemoveFromWishlistView(APIView):

    # السماح فقط للمستخدمين المسجلين
    permission_classes = [IsAuthenticated]

    # تنفيذ الكود عند استقبال طلب DELETE
    def delete(self, request):

        # استلام رقم المنتج من البيانات المرسلة
        product_id = request.data.get('product')

        try:
            # البحث عن المنتج داخل مفضلة المستخدم الحالي فقط
            item = Wishlist.objects.get(
                user=request.user,
                product_id=product_id
            )

            # حذف المنتج من المفضلة
            item.delete()

            # تأكيد نجاح عملية الحذف
            return Response(
                {'message': 'Removed'},
                status=200
            )

        except Wishlist.DoesNotExist:
            # في حالة عدم وجود المنتج في المفضلة
            return Response(
                {'error': 'Not found'},
                status=404
            )



# View مسؤولة عن عرض جميع المنتجات في المفضلة للمستخدم
class WishlistListView(APIView):

    # السماح فقط للمستخدمين المسجلين
    permission_classes = [IsAuthenticated]

    # تنفيذ الكود عند استقبال طلب GET
    def get(self, request):

        # جلب جميع عناصر المفضلة الخاصة بالمستخدم الحالي
        items = Wishlist.objects.filter(user=request.user)

        # تحويل البيانات من Objects إلى JSON
        serializer = WishlistSerializer(items, many=True)

        # إرجاع البيانات للـ Frontend
        return Response(serializer.data)

