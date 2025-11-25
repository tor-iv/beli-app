"""
Restaurant serializers for the REST API.

These serializers transform Django models to JSON and vice versa,
matching the TypeScript types expected by the frontend.
"""
from rest_framework import serializers
from .models import Restaurant


class RestaurantSerializer(serializers.ModelSerializer):
    """
    Full restaurant serializer matching TypeScript Restaurant type.

    Transforms database fields to camelCase for frontend compatibility.
    """
    # Transform snake_case to camelCase for frontend
    priceRange = serializers.CharField(source='price_range')
    ratingCount = serializers.IntegerField(source='rating_count')
    isOpen = serializers.BooleanField(source='is_open')
    acceptsReservations = serializers.BooleanField(source='accepts_reservations')
    popularDishes = serializers.ListField(source='popular_dishes', child=serializers.CharField())
    popularDishImages = serializers.ListField(source='popular_dish_images', child=serializers.CharField())
    goodFor = serializers.ListField(source='good_for', child=serializers.CharField())
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    # Nested location object (matches frontend Restaurant.location)
    location = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = [
            'id',
            'name',
            'cuisine',
            'category',
            'priceRange',
            'location',
            'hours',
            'phone',
            'website',
            'images',
            'popularDishImages',
            'tags',
            'popularDishes',
            'goodFor',
            'isOpen',
            'acceptsReservations',
            'rating',
            'ratingCount',
            'createdAt',
            'updatedAt',
        ]

    def get_location(self, obj):
        """Build nested location object matching frontend type."""
        return {
            'address': obj.address,
            'city': obj.city,
            'state': obj.state,
            'neighborhood': obj.neighborhood,
            'coordinates': {
                'lat': 0,  # TODO: Extract from PostGIS if needed
                'lng': 0,
            }
        }


class RestaurantListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for list views (less data transferred).
    """
    priceRange = serializers.CharField(source='price_range')
    ratingCount = serializers.IntegerField(source='rating_count')
    isOpen = serializers.BooleanField(source='is_open')

    # Simplified location
    neighborhood = serializers.CharField()
    city = serializers.CharField()

    class Meta:
        model = Restaurant
        fields = [
            'id',
            'name',
            'cuisine',
            'category',
            'priceRange',
            'neighborhood',
            'city',
            'images',
            'rating',
            'ratingCount',
            'isOpen',
        ]


class RestaurantSearchSerializer(serializers.Serializer):
    """
    Serializer for search query parameters.
    """
    q = serializers.CharField(required=False, allow_blank=True)
    cuisine = serializers.ListField(child=serializers.CharField(), required=False)
    priceRange = serializers.ListField(child=serializers.CharField(), required=False)
    neighborhood = serializers.CharField(required=False)
    category = serializers.CharField(required=False)
    isOpen = serializers.BooleanField(required=False)
