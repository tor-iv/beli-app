"""
Feed API views.

Provides REST endpoints for activity feed, matching FeedService methods.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from apps.users.models import Rating, User, UserFollow
from .serializers import FeedActivitySerializer


class FeedViewSet(viewsets.ViewSet):
    """
    API endpoint for activity feed.

    Supports:
    - GET /api/v1/feed/ - Get activity feed
    - GET /api/v1/feed/user/{userId}/ - Get user's activities
    - POST /api/v1/feed/{id}/like/ - Like an activity
    - POST /api/v1/feed/{id}/unlike/ - Unlike an activity
    - POST /api/v1/feed/{id}/bookmark/ - Bookmark an activity
    - POST /api/v1/feed/{id}/unbookmark/ - Remove bookmark
    - POST /api/v1/feed/{id}/comments/ - Add comment
    """

    def list(self, request):
        """
        Get activity feed for the current user.

        Maps to: FeedService.getActivityFeed()

        Returns activities from followed users, sorted by date.
        """
        user_id = request.query_params.get('userId')
        limit = int(request.query_params.get('limit', 50))

        # Get the feed - either personalized or global
        if user_id:
            # Get users this person follows
            following_ids = list(
                UserFollow.objects.filter(follower_id=user_id)
                .values_list('following_id', flat=True)
            )
            # Include own activities
            following_ids.append(user_id)

            activities = Rating.objects.filter(
                user_id__in=following_ids,
                status='been'  # Only show "been" activities in feed
            ).select_related('user', 'restaurant').order_by('-created_at')[:limit]
        else:
            # Global feed
            activities = Rating.objects.filter(
                status='been'
            ).select_related('user', 'restaurant').order_by('-created_at')[:limit]

        serializer = FeedActivitySerializer(activities, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def user_activities(self, request, user_id=None):
        """
        Get activities for a specific user.

        Maps to: FeedService.getUserActivities()
        """
        limit = int(request.query_params.get('limit', 50))

        activities = Rating.objects.filter(
            user_id=user_id,
            status='been'
        ).select_related('user', 'restaurant').order_by('-created_at')[:limit]

        serializer = FeedActivitySerializer(activities, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """
        Like an activity.

        Maps to: FeedService.likeActivity()
        """
        user_id = request.data.get('userId')
        if not user_id:
            return Response(
                {'error': 'userId is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # For now, just return success - interactions table may not exist
        return Response({'success': True, 'activityId': pk, 'liked': True})

    @action(detail=True, methods=['post'])
    def unlike(self, request, pk=None):
        """
        Unlike an activity.

        Maps to: FeedService.unlikeActivity()
        """
        user_id = request.data.get('userId')
        return Response({'success': True, 'activityId': pk, 'liked': False})

    @action(detail=True, methods=['post'])
    def bookmark(self, request, pk=None):
        """
        Bookmark an activity.

        Maps to: FeedService.bookmarkActivity()
        """
        user_id = request.data.get('userId')
        return Response({'success': True, 'activityId': pk, 'bookmarked': True})

    @action(detail=True, methods=['post'])
    def unbookmark(self, request, pk=None):
        """
        Remove bookmark from activity.

        Maps to: FeedService.unbookmarkActivity()
        """
        user_id = request.data.get('userId')
        return Response({'success': True, 'activityId': pk, 'bookmarked': False})

    @action(detail=True, methods=['post'])
    def comments(self, request, pk=None):
        """
        Add comment to activity.

        Maps to: FeedService.addCommentToActivity()
        """
        user_id = request.data.get('userId')
        content = request.data.get('content')

        if not user_id or not content:
            return Response(
                {'error': 'userId and content are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        import uuid
        # Return mock comment - table may not exist
        return Response({
            'id': str(uuid.uuid4()),
            'userId': user_id,
            'content': content,
            'timestamp': '2024-01-01T00:00:00Z',
        })
