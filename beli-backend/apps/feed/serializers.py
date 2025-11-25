"""
Feed serializers for the REST API.
"""
from rest_framework import serializers
from apps.users.models import Rating, User
from apps.restaurants.models import Restaurant
from apps.users.serializers import UserListSerializer
from apps.restaurants.serializers import RestaurantListSerializer


class FeedActivitySerializer(serializers.ModelSerializer):
    """
    Serializer for feed activities (ratings with user and restaurant data).
    Matches TypeScript Activity type.
    """
    # Nested objects
    user = UserListSerializer(read_only=True)
    restaurant = RestaurantListSerializer(read_only=True)

    # Transformed fields
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    visitDate = serializers.DateField(source='visit_date', allow_null=True)

    # Activity type - maps status to TypeScript expected 'type' field
    type = serializers.SerializerMethodField()

    # Computed interactions
    interactions = serializers.SerializerMethodField()

    class Meta:
        model = Rating
        fields = [
            'id',
            'type',
            'user',
            'restaurant',
            'status',
            'rating',
            'notes',
            'photos',
            'tags',
            'visitDate',
            'companions',
            'createdAt',
            'interactions',
        ]

    def get_type(self, obj):
        """Map status to TypeScript Activity type."""
        status_to_type = {
            'been': 'rating',
            'want_to_try': 'want-to-try',
            'recommended': 'recommendation',
        }
        return status_to_type.get(obj.status, 'rating')

    def get_interactions(self, obj):
        """Get likes, bookmarks, and comments for this activity."""
        # For now, return empty - interactions tables may not exist
        return {
            'likes': [],
            'bookmarks': [],
            'comments': [],
        }


class ActivityCommentSerializer(serializers.Serializer):
    """
    Serializer for activity comments.
    """
    id = serializers.UUIDField(read_only=True)
    userId = serializers.UUIDField(source='user_id')
    content = serializers.CharField()
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)


class FeedInteractionSerializer(serializers.Serializer):
    """
    Serializer for like/bookmark actions.
    """
    activityId = serializers.UUIDField()
    userId = serializers.UUIDField()
