from django.urls import path
from .views import (
    UserNotificationsListView,
    MarkNotificationReadView,
    MarkAllReadView,
    UnreadCountView,
)

urlpatterns = [
    path('', UserNotificationsListView.as_view(), name='notifications-list'),
    path('<int:pk>/read/', MarkNotificationReadView.as_view(), name='notification-read'),
    path('read-all/', MarkAllReadView.as_view(), name='notifications-read-all'),
    path('unread-count/', UnreadCountView.as_view(), name='notifications-unread-count'),
]
