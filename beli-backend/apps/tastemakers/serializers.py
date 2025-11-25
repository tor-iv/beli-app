"""
Tastemakers serializers.
"""
from rest_framework import serializers
from .models import TastemakerPost
from apps.users.serializers import UserListSerializer


class TastemakerPostSerializer(serializers.ModelSerializer):
    """
    Full tastemaker post serializer.
    """
    user = UserListSerializer(read_only=True)
    userId = serializers.UUIDField(source='user_id')
    coverImage = serializers.URLField(source='cover_image')
    restaurantIds = serializers.ListField(source='restaurant_ids', child=serializers.UUIDField())
    listIds = serializers.ListField(source='list_ids', child=serializers.UUIDField())
    isFeatured = serializers.BooleanField(source='is_featured')
    publishedAt = serializers.DateTimeField(source='published_at')
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    viewCount = serializers.IntegerField(source='view_count')

    # Computed interactions
    interactions = serializers.SerializerMethodField()

    class Meta:
        model = TastemakerPost
        fields = [
            'id',
            'userId',
            'user',
            'title',
            'subtitle',
            'coverImage',
            'content',
            'restaurantIds',
            'listIds',
            'tags',
            'isFeatured',
            'publishedAt',
            'updatedAt',
            'viewCount',
            'interactions',
        ]

    def get_interactions(self, obj):
        """Get likes and bookmarks count."""
        return {
            'likes': [],
            'bookmarks': [],
            'views': obj.view_count,
        }


class TastemakerPostListSerializer(serializers.ModelSerializer):
    """
    Lightweight post serializer for lists.
    """
    user = UserListSerializer(read_only=True)
    coverImage = serializers.URLField(source='cover_image')
    publishedAt = serializers.DateTimeField(source='published_at')
    viewCount = serializers.IntegerField(source='view_count')

    class Meta:
        model = TastemakerPost
        fields = [
            'id',
            'user',
            'title',
            'subtitle',
            'coverImage',
            'tags',
            'publishedAt',
            'viewCount',
        ]
