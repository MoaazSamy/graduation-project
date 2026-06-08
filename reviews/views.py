from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from products.models import Product
from .models import Review
from .serializers import ReviewSerializer


# إضافة Review على منتج
class AddReviewView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product')
        rating = request.data.get('rating')
        comment = request.data.get('comment', '')

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

        review, created = Review.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={
                'rating': rating,
                'comment': comment
            }
        )

        if not created:
            return Response({'message': 'Review already exists'}, status=400)

        serializer = ReviewSerializer(review)
        return Response(serializer.data, status=201)

# عرض جميع التقييمات الخاصة بمنتج معين
class ProductReviewsView(APIView):

    def get(self, request, product_id):
        reviews = Review.objects.filter(product_id=product_id)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
