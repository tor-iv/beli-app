"""
Notifications API views.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class NotificationsViewSet(viewsets.ViewSet):
    """
    API endpoint for notifications.

    Supports:
    - GET /api/v1/notifications/ - Get all notifications
    - POST /api/v1/notifications/{id}/read/ - Mark as read
    - POST /api/v1/notifications/read-all/ - Mark all as read
    - GET /api/v1/notifications/unread-count/ - Get unread count
    """

    def list(self, request):
        """
        Get user's notifications.

        Maps to: NotificationService.getNotifications()

        Note: Returns empty array if notifications table doesn't exist in Supabase.
        """
        try:
            user_id = request.query_params.get('userId')
            limit = int(request.query_params.get('limit', 50))

            queryset = Notification.objects.select_related(
                'actor_user', 'target_restaurant'
            ).order_by('-created_at')

            if user_id:
                queryset = queryset.filter(user_id=user_id)

            queryset = queryset[:limit]

            serializer = NotificationSerializer(queryset, many=True)
            return Response(serializer.data)
        except Exception:
            # Table doesn't exist yet in Supabase
            return Response([])

    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        """
        Mark notification as read.

        Maps to: NotificationService.markNotificationAsRead()
        """
        try:
            notification = Notification.objects.get(id=pk)
            notification.is_read = True
            notification.save(update_fields=['is_read'])
            return Response({'success': True})
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'], url_path='read-all')
    def read_all(self, request):
        """
        Mark all notifications as read.

        Maps to: NotificationService.markAllNotificationsAsRead()
        """
        user_id = request.data.get('userId')
        if not user_id:
            return Response(
                {'error': 'userId is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        Notification.objects.filter(
            user_id=user_id,
            is_read=False
        ).update(is_read=True)

        return Response({'success': True})

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        """
        Get count of unread notifications.

        Maps to: NotificationService.getUnreadNotificationCount()
        """
        try:
            user_id = request.query_params.get('userId')
            if not user_id:
                return Response({'count': 0})

            count = Notification.objects.filter(
                user_id=user_id,
                is_read=False
            ).count()

            return Response({'count': count})
        except Exception:
            # Table doesn't exist yet in Supabase
            return Response({'count': 0})
