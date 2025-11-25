"""
User API views.

Provides REST endpoints for user data, matching the frontend
UserService and UserRestaurantService methods.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count

from .models import User, UserFollow, Rating
from .serializers import (
    UserSerializer,
    UserListSerializer,
    RatingSerializer,
)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for users.

    Supports:
    - GET /api/v1/users/ - List all users
    - GET /api/v1/users/{id}/ - Get single user
    - GET /api/v1/users/me/ - Get current user (demo)
    - GET /api/v1/users/search/ - Search users
    - GET /api/v1/users/leaderboard/ - Get leaderboard
    - GET /api/v1/users/{id}/followers/ - Get user's followers
    - GET /api/v1/users/{id}/following/ - Get users this user follows
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'

    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        return UserSerializer

    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Get current user (demo mode - returns first user).

        Maps to: UserService.getCurrentUser()
        """
        # In demo mode, return a specific user or first user
        demo_user_id = request.query_params.get('userId')
        if demo_user_id:
            user = User.objects.filter(id=demo_user_id).first()
        else:
            user = User.objects.first()

        if not user:
            return Response(
                {'error': 'No users found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserSerializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Search users by username or display name.

        Maps to: UserService.searchUsers()
        """
        query = request.query_params.get('q', '')
        if not query:
            return Response([])

        queryset = self.get_queryset().filter(
            Q(username__icontains=query) |
            Q(display_name__icontains=query)
        )[:20]

        serializer = UserListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """
        Get user leaderboard sorted by been_count.

        Maps to: UserService.getLeaderboard()
        """
        limit = int(request.query_params.get('limit', 50))
        city = request.query_params.get('city')

        queryset = self.get_queryset().annotate(
            been_count=Count('ratings', filter=Q(ratings__status='been'))
        ).order_by('-been_count')

        if city:
            queryset = queryset.filter(city__icontains=city)

        users = queryset[:limit]

        # Add rank to each user
        result = []
        for rank, user in enumerate(users, start=1):
            user_data = UserSerializer(user).data
            user_data['stats']['rank'] = rank
            result.append(user_data)

        return Response(result)

    @action(detail=True, methods=['get'])
    def followers(self, request, id=None):
        """
        Get users who follow this user.

        Maps to: UserService.getFollowers()
        """
        user = self.get_object()
        follower_ids = UserFollow.objects.filter(
            following=user
        ).values_list('follower_id', flat=True)

        followers = User.objects.filter(id__in=follower_ids)
        serializer = UserListSerializer(followers, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def following(self, request, id=None):
        """
        Get users this user follows.

        Maps to: UserService.getFollowing()
        """
        user = self.get_object()
        following_ids = UserFollow.objects.filter(
            follower=user
        ).values_list('following_id', flat=True)

        following = User.objects.filter(id__in=following_ids)
        serializer = UserListSerializer(following, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def ratings(self, request, id=None):
        """
        Get user's restaurant ratings.

        Maps to: UserRestaurantService.getUserRestaurantRelations()
        """
        user = self.get_object()
        status_filter = request.query_params.get('status')

        queryset = Rating.objects.filter(user=user)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        serializer = RatingSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def watchlist(self, request, id=None):
        """
        Get user's watchlist (want-to-try restaurants).

        Maps to: UserRestaurantService.getWatchlist()
        """
        user = self.get_object()

        if not user.watchlist:
            return Response([])

        from apps.restaurants.models import Restaurant
        from apps.restaurants.serializers import RestaurantListSerializer

        restaurants = Restaurant.objects.filter(id__in=user.watchlist)
        serializer = RestaurantListSerializer(restaurants, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='match/(?P<target_id>[^/.]+)')
    def match(self, request, id=None, target_id=None):
        """
        Calculate match percentage between two users.

        Maps to: UserService.getUserMatchPercentage()
        """
        from .services import MatchService

        match_percent = MatchService.calculate_match(id, target_id)
        return Response({'matchPercentage': match_percent})

    @action(detail=False, methods=['get'], url_path='username/(?P<username>[^/.]+)')
    def by_username(self, request, username=None):
        """
        Get user by username.

        Maps to: UserService.getUserByUsername()
        """
        user = User.objects.filter(username=username).first()
        if not user:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserSerializer(user)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='taste-profile')
    def taste_profile(self, request, id=None):
        """
        Get user's taste profile analytics.

        Analyzes dining history to generate insights about:
        - Top cuisines
        - Price preferences
        - Rating patterns
        - Adventurousness score

        Maps to: TasteProfileService.getTasteProfile()
        """
        from .services import TasteProfileService

        profile = TasteProfileService.get_taste_profile(id)
        return Response(profile)
