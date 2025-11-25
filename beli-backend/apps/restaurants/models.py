"""
Restaurant models - maps to existing Supabase 'restaurants' table.

Uses managed=False to prevent Django from modifying the table structure.

IMPORTANT: Supabase stores array fields as JSONB, not PostgreSQL arrays.
Use JSONField instead of ArrayField for compatibility.
"""
import uuid
from django.db import models


class Restaurant(models.Model):
    """
    Restaurant model matching Supabase restaurants table exactly.

    Note: coordinates field is PostGIS geography, accessed via raw SQL if needed.
    Note: Array-like fields (cuisine, images, tags, etc.) are stored as JSONB in Supabase.
    """
    CATEGORY_CHOICES = [
        ('restaurants', 'Restaurants'),
        ('coffee', 'Coffee'),
        ('bars', 'Bars'),
        ('bakeries', 'Bakeries'),
    ]

    PRICE_RANGE_CHOICES = [
        ('$', '$'),
        ('$$', '$$'),
        ('$$$', '$$$'),
        ('$$$$', '$$$$'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    # JSONB array in Supabase, not PostgreSQL native array
    cuisine = models.JSONField(default=list)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='restaurants')
    price_range = models.CharField(max_length=4, choices=PRICE_RANGE_CHOICES, default='$$')

    # Location
    address = models.CharField(max_length=500)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    neighborhood = models.CharField(max_length=100)
    # Note: coordinates is PostGIS geography point - not directly mapped
    # Access via raw SQL: ST_X(coordinates::geometry), ST_Y(coordinates::geometry)

    # Hours stored as JSON: { "monday": "9am-10pm", ... }
    hours = models.JSONField(default=dict, blank=True, null=True)

    # Contact
    phone = models.CharField(max_length=50, blank=True, null=True)
    website = models.URLField(max_length=500, blank=True, null=True)

    # Media - JSONB arrays in Supabase
    images = models.JSONField(default=list)
    popular_dish_images = models.JSONField(default=list)

    # Metadata - JSONB arrays in Supabase
    tags = models.JSONField(default=list)
    popular_dishes = models.JSONField(default=list)
    good_for = models.JSONField(default=list)

    # Status
    is_open = models.BooleanField(default=True)
    accepts_reservations = models.BooleanField(default=False)

    # Ratings (aggregate from user ratings)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    rating_count = models.IntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False  # Don't let Django manage this table
        db_table = 'restaurants'
        ordering = ['-rating']

    def __str__(self):
        return f"{self.name} ({self.neighborhood})"
