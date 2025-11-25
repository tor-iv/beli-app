"""
Lists serializers for the REST API.
"""
from rest_framework import serializers
from .models import List
from apps.users.serializers import UserListSerializer


class ListSerializer(serializers.ModelSerializer):
    """
    Full list serializer matching TypeScript List type.
    """
    userId = serializers.UUIDField(source='user_id')
    isPublic = serializers.BooleanField(source='is_public')
    listType = serializers.CharField(source='list_type')
    thumbnailImage = serializers.URLField(source='thumbnail_image', allow_null=True)
    isFeatured = serializers.BooleanField(source='is_featured', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    # Restaurant count
    restaurantCount = serializers.SerializerMethodField()

    class Meta:
        model = List
        fields = [
            'id',
            'userId',
            'name',
            'description',
            'restaurants',
            'restaurantCount',
            'isPublic',
            'category',
            'listType',
            'thumbnailImage',
            'isFeatured',
            'createdAt',
            'updatedAt',
        ]

    def get_restaurantCount(self, obj):
        return len(obj.restaurants) if obj.restaurants else 0


class ListCreateSerializer(serializers.Serializer):
    """
    Serializer for creating a list.
    """
    userId = serializers.UUIDField()
    name = serializers.CharField(max_length=200)
    description = serializers.CharField(required=False, allow_blank=True, default='')
    restaurants = serializers.ListField(child=serializers.UUIDField(), required=False, default=list)
    isPublic = serializers.BooleanField(default=True)
    category = serializers.CharField(default='restaurants')
    listType = serializers.CharField(default='playlists')


class ListUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating a list.
    """
    name = serializers.CharField(max_length=200, required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    restaurants = serializers.ListField(child=serializers.UUIDField(), required=False)
    isPublic = serializers.BooleanField(required=False)
