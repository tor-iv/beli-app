"""
Django Admin for Restaurant models.
"""

from django.contrib.gis import admin as gis_admin
from django.contrib import admin
from .models import Restaurant, MenuItem


@admin.register(Restaurant)
class RestaurantAdmin(gis_admin.GISModelAdmin):
    """
    Admin interface for Restaurant model.
    Uses GISModelAdmin for map widget on coordinates field.
    """

    list_display = [
        'name',
        'neighborhood',
        'city',
        'rating',
        'price_range',
        'category',
        'is_open',
        'accepts_reservations',
        'created_at',
    ]

    list_filter = [
        'category',
        'price_range',
        'city',
        'neighborhood',
        'is_open',
        'accepts_reservations',
        'created_at',
    ]

    search_fields = [
        'name',
        'address',
        'city',
        'neighborhood',
        'cuisine',  # JSON field - will search within
    ]

    readonly_fields = [
        'id',
        'created_at',
        'updated_at',
        'latitude',
        'longitude',
    ]

    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'category', 'cuisine', 'price_range')
        }),
        ('Location', {
            'fields': (
                'address',
                'city',
                'state',
                'neighborhood',
                'coordinates',
                'latitude',
                'longitude',
            )
        }),
        ('Contact', {
            'fields': ('phone', 'website'),
            'classes': ('collapse',),
        }),
        ('Hours', {
            'fields': ('hours',),
            'classes': ('collapse',),
        }),
        ('Media', {
            'fields': ('images', 'popular_dish_images'),
            'classes': ('collapse',),
        }),
        ('Metadata', {
            'fields': ('tags', 'popular_dishes', 'good_for'),
            'classes': ('collapse',),
        }),
        ('Status', {
            'fields': ('is_open', 'accepts_reservations'),
        }),
        ('Ratings & Scores', {
            'fields': (
                'rating',
                'rating_count',
                'rec_score',
                'rec_score_sample_size',
                'friend_score',
                'friend_score_sample_size',
                'average_score',
                'average_score_sample_size',
            ),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    # Map widget configuration
    default_lon = -73.9855  # NYC longitude
    default_lat = 40.7580   # NYC latitude
    default_zoom = 12

    ordering = ['-rating', 'name']
    date_hierarchy = 'created_at'


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    """Admin interface for MenuItem model."""

    list_display = [
        'name',
        'restaurant',
        'category',
        'price',
        'portion_size',
        'popularity',
        'is_vegetarian',
        'is_gluten_free',
    ]

    list_filter = [
        'category',
        'portion_size',
        'is_vegetarian',
        'is_vegan',
        'is_gluten_free',
        'restaurant__city',
    ]

    search_fields = [
        'name',
        'description',
        'restaurant__name',
    ]

    readonly_fields = ['id', 'created_at', 'updated_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'restaurant', 'name', 'description', 'category')
        }),
        ('Pricing & Size', {
            'fields': ('price', 'portion_size')
        }),
        ('Dietary Info', {
            'fields': (
                'is_vegetarian',
                'is_vegan',
                'is_gluten_free',
                'spice_level',
            )
        }),
        ('Metadata', {
            'fields': ('tags', 'meal_time', 'popularity'),
            'classes': ('collapse',),
        }),
        ('Media', {
            'fields': ('image_url',),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    autocomplete_fields = ['restaurant']  # Autocomplete for restaurant selection
    ordering = ['restaurant__name', 'category', '-popularity']
