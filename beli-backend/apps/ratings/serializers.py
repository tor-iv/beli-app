"""
Ratings serializers for CRUD operations.
"""
from rest_framework import serializers
from apps.users.models import Rating, User
from apps.restaurants.models import Restaurant
from apps.restaurants.serializers import RestaurantListSerializer


class RatingCreateSerializer(serializers.Serializer):
    """
    Serializer for creating/updating a rating.
    """
    userId = serializers.UUIDField()
    restaurantId = serializers.UUIDField()
    status = serializers.ChoiceField(choices=['been', 'want_to_try', 'recommended'])
    rating = serializers.DecimalField(max_digits=3, decimal_places=1, required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    photos = serializers.ListField(child=serializers.URLField(), required=False, default=list)
    tags = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    visitDate = serializers.DateField(required=False, allow_null=True)
    companions = serializers.ListField(child=serializers.UUIDField(), required=False, default=list)


class RatingDetailSerializer(serializers.ModelSerializer):
    """
    Detailed rating serializer with restaurant info.
    """
    userId = serializers.UUIDField(source='user_id')
    restaurantId = serializers.UUIDField(source='restaurant_id')
    restaurant = RestaurantListSerializer(read_only=True)
    rankIndex = serializers.IntegerField(source='rank_index', allow_null=True)
    visitDate = serializers.DateField(source='visit_date', allow_null=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Rating
        fields = [
            'id',
            'userId',
            'restaurantId',
            'restaurant',
            'status',
            'rating',
            'rankIndex',
            'notes',
            'photos',
            'tags',
            'visitDate',
            'companions',
            'createdAt',
            'updatedAt',
        ]


class RatingListSerializer(serializers.ModelSerializer):
    """
    Lightweight rating serializer for lists.
    """
    userId = serializers.UUIDField(source='user_id')
    restaurantId = serializers.UUIDField(source='restaurant_id')
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
            'visitDate',
            'createdAt',
        ]


class FriendRecommendationSerializer(serializers.Serializer):
    """
    Serializer for friend recommendations.
    """
    restaurant = RestaurantListSerializer()
    friendRating = serializers.DecimalField(max_digits=3, decimal_places=1)
    recommenderName = serializers.CharField()
    recommenderUsername = serializers.CharField()
    recommenderCount = serializers.IntegerField()
