"""
Menus serializers.
"""
from rest_framework import serializers
from .models import MenuItem


class MenuItemSerializer(serializers.ModelSerializer):
    """
    Menu item serializer.
    """
    restaurantId = serializers.UUIDField(source='restaurant_id')
    isPopular = serializers.BooleanField(source='is_popular')
    dietaryInfo = serializers.ListField(source='dietary_info', child=serializers.CharField())
    imageUrl = serializers.URLField(source='image_url', allow_null=True)

    class Meta:
        model = MenuItem
        fields = [
            'id',
            'restaurantId',
            'name',
            'description',
            'price',
            'category',
            'isPopular',
            'dietaryInfo',
            'imageUrl',
        ]


class OrderSuggestionRequestSerializer(serializers.Serializer):
    """
    Request serializer for order suggestions.
    """
    restaurantId = serializers.UUIDField()
    partySize = serializers.IntegerField(min_value=1, max_value=20)
    hungerLevel = serializers.ChoiceField(
        choices=['light', 'moderate', 'very-hungry'],
        default='moderate'
    )
    mealTime = serializers.ChoiceField(
        choices=['breakfast', 'lunch', 'dinner', 'any-time'],
        default='dinner'
    )
    dietaryRestrictions = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list
    )
