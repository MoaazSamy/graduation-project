from django.contrib import admin
from .models import Order, OrderItem, Coupon

admin.site.register(Order)
admin.site.register(OrderItem)

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_percent', 'active', 'created_at')
    search_fields = ('code',)
    list_filter = ('active', 'created_at')
