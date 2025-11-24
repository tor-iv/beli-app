"""
Restaurant API Serializers.

Converts Django models to/from JSON for REST API.
"""

from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Restaurant, MenuItem


class MenuItemSerializer(serializers.ModelSerializer):
    """Serializer for MenuItem model."""

    class Meta:
        model = MenuItem
        fields = [
            'id',
            'name',
            'description',
            'price',
            'category',
            'image_url',
            'portion_size',
            'tags',
            'popularity',
            'is_vegetarian',
            'is_vegan',
            'is_gluten_free',
            'spice_level',
            'meal_time',
        ]
        read_only_fields = ['id']


class RestaurantListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for restaurant lists.

    Used for:
    - Search results
    - Feed items
    - List views

    Excludes heavy fields (menu items, detailed scores).
    """

    latitude = serializers.FloatField(read_only=True)
    longitude = serializers.FloatField(read_only=True)

    # Computed field for distance (set by view if available)
    distance = serializers.FloatField(read_only=True, required=False)

    class Meta:
        model = Restaurant
        fields = [
            'id',
            'name',
            'cuisine',
            'category',
            'price_range',
            # Location
            'address',
            'city',
            'state',
            'neighborhood',
            'latitude',
            'longitude',
            'distance',  # Optional, calculated in view
            # Ratings
            'rating',
            'rating_count',
            'rec_score',
            'friend_score',
            'average_score',
            # Preview data
            'images',  # Array of S3 URLs
            'popular_dishes',
            'tags',
            # Status
            'is_open',
            'accepts_reservations',
        ]
        read_only_fields = ['id', 'latitude', 'longitude', 'distance']


class RestaurantDetailSerializer(serializers.ModelSerializer):
    """
    Complete serializer for restaurant detail view.

    Includes all fields + related menu items.
    """

    latitude = serializers.FloatField(read_only=True)
    longitude = serializers.FloatField(read_only=True)
    distance = serializers.FloatField(read_only=True, required=False)

    # Nested menu items (read-only, loaded via prefetch_related)
    menu_items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            'id',
            'name',
            'cuisine',
            'category',
            'price_range',
            # Location
            'address',
            'city',
            'state',
            'neighborhood',
            'latitude',
            'longitude',
            'distance',
            # Contact
            'phone',
            'website',
            # Hours
            'hours',
            # Media
            'images',
            'popular_dish_images',
            # Metadata
            'tags',
            'popular_dishes',
            'good_for',
            # Status
            'is_open',
            'accepts_reservations',
            # Ratings & Scores
            'rating',
            'rating_count',
            'rec_score',
            'rec_score_sample_size',
            'friend_score',
            'friend_score_sample_size',
            'average_score',
            'average_score_sample_size',
            # Menu
            'menu_items',
            # Timestamps
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'latitude', 'longitude', 'distance', 'created_at', 'updated_at']


class RestaurantCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating/updating restaurants.

    Accepts latitude/longitude and converts to Point field.
    """

    latitude = serializers.FloatField(write_only=True)
    longitude = serializers.FloatField(write_only=True)

    class Meta:
        model = Restaurant
        fields = [
            'name',
            'cuisine',
            'category',
            'price_range',
            # Location
            'address',
            'city',
            'state',
            'neighborhood',
            'latitude',  # Write-only
            'longitude',  # Write-only
            # Contact
            'phone',
            'website',
            # Hours
            'hours',
            # Media
            'images',
            'popular_dish_images',
            # Metadata
            'tags',
            'popular_dishes',
            'good_for',
            # Status
            'is_open',
            'accepts_reservations',
        ]

    def create(self, validated_data):
        """Override create to handle coordinate conversion."""
        from django.contrib.gis.geos import Point

        lat = validated_data.pop('latitude')
        lng = validated_data.pop('longitude')

        validated_data['coordinates'] = Point(lng, lat, srid=4326)

        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Override update to handle coordinate conversion."""
        from django.contrib.gis.geos import Point

        lat = validated_data.pop('latitude', None)
        lng = validated_data.pop('longitude', None)

        if lat is not None and lng is not None:
            validated_data['coordinates'] = Point(lng, lat, srid=4326)

        return super().update(instance, validated_data)


class NearbyRestaurantSerializer(GeoFeatureModelSerializer):
    """
    GeoJSON serializer for map-based restaurant display.

    Returns restaurants in GeoJSON format for mapping libraries.

    Example response:
    {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [-73.9855, 40.7580]
                },
                "properties": {
                    "id": "...",
                    "name": "Joe's Pizza",
                    "rating": 8.5,
                    ...
                }
            }
        ]
    }
    """

    distance = serializers.FloatField(read_only=True, required=False)

    class Meta:
        model = Restaurant
        geo_field = 'coordinates'  # The field to use for geometry
        fields = [
            'id',
            'name',
            'cuisine',
            'category',
            'price_range',
            'neighborhood',
            'rating',
            'rating_count',
            'images',
            'is_open',
            'distance',
        ]
        read_only_fields = ['id', 'distance']
