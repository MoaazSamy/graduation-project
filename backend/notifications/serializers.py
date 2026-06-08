from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type',
            'related_order', 'is_read', 'created_at', 'time_ago'
        ]

    def get_time_ago(self, obj):
        from django.utils import timezone
        now = timezone.now()
        diff = now - obj.created_at

        seconds = diff.total_seconds()
        if seconds < 60:
            return "الآن"
        elif seconds < 3600:
            mins = int(seconds // 60)
            return f"منذ {mins} دقيقة" if mins == 1 else f"منذ {mins} دقائق"
        elif seconds < 86400:
            hours = int(seconds // 3600)
            return f"منذ {hours} ساعة" if hours == 1 else f"منذ {hours} ساعات"
        else:
            days = int(seconds // 86400)
            return f"منذ {days} يوم" if days == 1 else f"منذ {days} أيام"
