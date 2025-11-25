"""
Tastemakers API views.

Provides REST endpoints for tastemaker profiles and posts.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count

from .models import TastemakerPost
from .serializers import TastemakerPostSerializer, TastemakerPostListSerializer
from apps.users.models import User
from apps.users.serializers import UserSerializer, UserListSerializer


class TastemakersViewSet(viewsets.ViewSet):
    """
    API endpoint for tastemakers.

    Supports:
    - GET /api/v1/tastemakers/ - Get all tastemakers
    - GET /api/v1/tastemakers/username/{username}/ - Get by username
    - GET /api/v1/tastemakers/posts/ - Get all posts
    - GET /api/v1/tastemakers/posts/featured/ - Get featured posts
    - GET /api/v1/tastemakers/posts/{id}/ - Get single post
    - GET /api/v1/tastemakers/posts/user/{userId}/ - Get user's posts
    - POST /api/v1/tastemakers/posts/{id}/like/ - Like a post
    - POST /api/v1/tastemakers/posts/{id}/view/ - Increment view count
    """

    def list(self, request):
        """
        Get all tastemakers.

        Maps to: TastemakerService.getTastemakers()
        """
        limit = int(request.query_params.get('limit', 50))

        tastemakers = User.objects.filter(
            is_tastemaker=True
        ).annotate(
            follower_count=Count('followers_set')
        ).order_by('-follower_count')[:limit]

        serializer = UserSerializer(tastemakers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='username/(?P<username>[^/.]+)')
    def by_username(self, request, username=None):
        """
        Get tastemaker by username.

        Maps to: TastemakerService.getTastemakerByUsername()
        """
        try:
            user = User.objects.get(username=username, is_tastemaker=True)
        except User.DoesNotExist:
            return Response(
                {'error': 'Tastemaker not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserSerializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def posts(self, request):
        """
        Get all tastemaker posts.

        Maps to: TastemakerService.getTastemakerPosts()
        """
        limit = int(request.query_params.get('limit', 50))

        posts = TastemakerPost.objects.select_related('user').order_by('-published_at')[:limit]
        serializer = TastemakerPostListSerializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='posts/featured')
    def featured_posts(self, request):
        """
        Get featured tastemaker posts.

        Maps to: TastemakerService.getFeaturedTastemakerPosts()
        """
        limit = int(request.query_params.get('limit', 10))

        posts = TastemakerPost.objects.filter(
            is_featured=True
        ).select_related('user').order_by('-view_count')[:limit]

        serializer = TastemakerPostListSerializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='posts/(?P<post_id>[^/.]+)')
    def post_detail(self, request, post_id=None):
        """
        Get a single tastemaker post.

        Maps to: TastemakerService.getTastemakerPostById()
        """
        try:
            post = TastemakerPost.objects.select_related('user').get(id=post_id)
        except TastemakerPost.DoesNotExist:
            return Response(
                {'error': 'Post not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = TastemakerPostSerializer(post)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='posts/user/(?P<user_id>[^/.]+)')
    def user_posts(self, request, user_id=None):
        """
        Get posts by a specific user.

        Maps to: TastemakerService.getTastemakerPostsByUser()
        """
        limit = int(request.query_params.get('limit', 20))

        posts = TastemakerPost.objects.filter(
            user_id=user_id
        ).select_related('user').order_by('-published_at')[:limit]

        serializer = TastemakerPostListSerializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='posts/(?P<post_id>[^/.]+)/like')
    def like_post(self, request, post_id=None):
        """
        Like a tastemaker post.

        Maps to: TastemakerService.likeTastemakerPost()
        """
        user_id = request.data.get('userId')
        return Response({'success': True, 'postId': post_id, 'liked': True})

    @action(detail=False, methods=['post'], url_path='posts/(?P<post_id>[^/.]+)/view')
    def view_post(self, request, post_id=None):
        """
        Increment post view count.

        Maps to: TastemakerService.incrementPostViews()
        """
        try:
            post = TastemakerPost.objects.get(id=post_id)
            post.view_count += 1
            post.save(update_fields=['view_count'])
            return Response({'success': True, 'views': post.view_count})
        except TastemakerPost.DoesNotExist:
            return Response(
                {'error': 'Post not found'},
                status=status.HTTP_404_NOT_FOUND
            )
