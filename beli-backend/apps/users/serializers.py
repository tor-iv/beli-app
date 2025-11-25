"""
User serializers for the REST API.

These serializers transform Django models to JSON,
matching the TypeScript types expected by the frontend.
"""
from rest_framework import serializers
from .models import User, UserFollow, Rating


class UserStatsSerializer(serializers.Serializer):
    """
    User statistics - computed from related tables.
    Matches TypeScript UserStats type.
    """
    followers = serializers.IntegerField()
    following = serializers.IntegerField()
    beenCount = serializers.IntegerField()
    wantToTryCount = serializers.IntegerField()


class UserSerializer(serializers.ModelSerializer):
    """
    Full user serializer matching TypeScript User type.
    """
    # Transform snake_case to camelCase
    displayName = serializers.CharField(source='display_name')
    isTastemaker = serializers.BooleanField(source='is_tastemaker')
    memberSince = serializers.DateTimeField(source='created_at', read_only=True)

    # Nested location
    location = serializers.SerializerMethodField()

    # Computed stats
    stats = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'displayName',
            'avatar',
            'bio',
            'location',
            'isTastemaker',
            'memberSince',
            'stats',
        ]

    def get_location(self, obj):
        """Build nested location object."""
        if obj.city:
            return {
                'city': obj.city,
                'state': obj.state or '',
            }
        return None

    def get_stats(self, obj):
        """Compute user stats from related models."""
        return {
            'followers': obj.followers_set.count(),
            'following': obj.following_set.count(),
            'beenCount': obj.ratings.filter(status='been').count(),
            'wantToTryCount': len(obj.watchlist) if obj.watchlist else 0,
        }


class UserListSerializer(serializers.ModelSerializer):
    """
    Lightweight user serializer for lists.
    Includes stats to match TypeScript User type.
    """
    displayName = serializers.CharField(source='display_name')
    stats = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'displayName', 'avatar', 'stats']

    def get_stats(self, obj):
        """Compute user stats from related models."""
        return {
            'followers': obj.followers_set.count(),
            'following': obj.following_set.count(),
            'beenCount': obj.ratings.filter(status='been').count(),
            'wantToTryCount': len(obj.watchlist) if obj.watchlist else 0,
        }


class RatingSerializer(serializers.ModelSerializer):
    """
    Rating serializer matching TypeScript UserRestaurantRelation type.
    """
    userId = serializers.UUIDField(source='user_id')
    restaurantId = serializers.UUIDField(source='restaurant_id')
    rankIndex = serializers.IntegerField(source='rank_index', allow_null=True)
    visitDate = serializers.DateField(source='visit_date', allow_null=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Rating
        fields = [
            'id',
            'userId',
            'restaurantId',
            'status',
            'rating',
            'rankIndex',
            'notes',
            'photos',
            'tags',
            'visitDate',
            'companions',
            'createdAt',
        ]


class FollowSerializer(serializers.ModelSerializer):
    """
    Serializer for follow relationships.
    """
    followerId = serializers.UUIDField(source='follower_id')
    followingId = serializers.UUIDField(source='following_id')

    class Meta:
        model = UserFollow
        fields = ['followerId', 'followingId', 'created_at']
