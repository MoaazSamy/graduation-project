from products.serializers import ProductCreateSerializer
data = {
    'name': 'test', 'description': 'desc', 'price': 100, 'category': 5, 'stock': 1,
    'storage_options': '[{"storage":"128GB","price":100}]'
}
s = ProductCreateSerializer(data=data)
s.is_valid()
print('Data type:', type(s.validated_data.get('storage_options')))
