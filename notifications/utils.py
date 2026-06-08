from django.contrib.auth.models import User
from .models import Notification


def create_notification(user, title, message, notification_type='general', related_order=None):
    """إنشاء إشعار لمستخدم واحد"""
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        related_order=related_order
    )


def notify_admins(title, message, notification_type='order_created', related_order=None):
    """إرسال إشعار لكل الأدمنز"""
    admins = User.objects.filter(is_staff=True)
    notifications = []
    for admin in admins:
        notifications.append(
            Notification(
                user=admin,
                title=title,
                message=message,
                notification_type=notification_type,
                related_order=related_order
            )
        )
    Notification.objects.bulk_create(notifications)


def notify_order_status_change(order, old_status, new_status):
    """إشعار المستخدم بتغيير حالة طلبه"""
    STATUS_AR = {
        'pending': 'قيد الانتظار',
        'processing': 'قيد التجهيز',
        'shipped': 'تم الشحن',
        'delivered': 'تم التوصيل',
        'completed': 'مكتمل',
        'cancelled': 'ملغى',
    }

    status_text = STATUS_AR.get(new_status, new_status)

    # إشعار للمستخدم
    create_notification(
        user=order.user,
        title=f'تحديث الطلب #{order.id}',
        message=f'تم تحديث حالة طلبك رقم #{order.id} إلى: {status_text}',
        notification_type='order_status' if new_status != 'cancelled' else 'order_cancelled',
        related_order=order
    )
