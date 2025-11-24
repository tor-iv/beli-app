"""
Restaurant Models

Fat Model Design Philosophy:
- Single denormalized table for optimal read performance
- Embedded location data (no separate Location table)
- JSON fields for flexible arrays (images, tags, cuisines)
- PostGIS PointField for geospatial queries
- Optimized for 95% read / 5% write workload
"""

import uuid
from django.contrib.gis.db import models as gis_models
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Restaurant(gis_models.Model):
    """
    Core Restaurant model with embedded location and hours.

    Design decisions:
    - UUID primary key (better for distributed systems, no sequential ID leakage)
    - Embedded location fields (no JOIN overhead)
    - JSON fields for arrays (images, tags, cuisines) - flexible and fast
    - PostGIS PointField for geospatial queries (nearby restaurants)
    - Denormalized scores for query performance (recalculated periodically)
    """

    # ========== Identity ==========
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for this restaurant"
    )

    name = models.CharField(
        max_length=255,
        db_index=True,  # Index for search queries
        help_text="Restaurant name"
    )

    # ========== Cuisine & Category ==========
    cuisine = models.JSONField(
        default=list,
        help_text='Array of cuisine types, e.g., ["Italian", "Pizza"]'
    )

    category = models.CharField(
        max_length=50,
        choices=[
            ('restaurants', 'Restaurants'),
            ('bars', 'Bars'),
            ('bakeries', 'Bakeries'),
            ('coffee_tea', 'Coffee & Tea'),
            ('dessert', 'Dessert'),
            ('other', 'Other'),
        ],
        default='restaurants',
        db_index=True,  # Index for filtering
        help_text="Primary category for filtering"
    )

    price_range = models.CharField(
        max_length=4,
        choices=[
            ('$', '$'),
            ('$$', '$$'),
            ('$$$', '$$$'),
            ('$$$$', '$$$$'),
        ],
        default='$$',
        db_index=True,  # Index for filtering
        help_text="Price range indicator"
    )

    # ========== Location (Embedded - No separate table) ==========
    address = models.CharField(
        max_length=500,
        help_text="Street address"
    )

    city = models.CharField(
        max_length=100,
        db_index=True,  # Index for city filtering
        help_text="City name"
    )

    state = models.CharField(
        max_length=50,
        db_index=True,  # Index for state filtering
        help_text="State/province"
    )

    neighborhood = models.CharField(
        max_length=100,
        db_index=True,  # Index for neighborhood filtering
        help_text="Neighborhood/district"
    )

    coordinates = gis_models.PointField(
        geography=True,  # Use geography for accurate distance calculations
        srid=4326,  # WGS84 coordinate system (lat/lng)
        help_text="Geographic coordinates for location queries"
    )
    # SPATIAL INDEX created automatically by PostGIS (GIST index)

    # ========== Operating Hours (JSON - Flexible) ==========
    hours = models.JSONField(
        default=dict,
        blank=True,
        help_text='Operating hours as JSON: {"monday": "11:00 AM - 10:00 PM", "tuesday": "Closed"}'
    )

    # ========== Contact Info ==========
    phone = models.CharField(
        max_length=20,
        blank=True,
        help_text="Phone number"
    )

    website = models.URLField(
        blank=True,
        help_text="Website URL"
    )

    # ========== Images (S3 URLs as JSON array) ==========
    images = models.JSONField(
        default=list,
        help_text='Array of S3 image URLs, e.g., ["https://s3.../image1.jpg"]'
    )

    popular_dish_images = models.JSONField(
        default=list,
        help_text='Array of S3 URLs for popular dish photos'
    )

    # ========== Metadata ==========
    tags = models.JSONField(
        default=list,
        help_text='Array of tags, e.g., ["romantic", "outdoor-seating", "live-music"]'
    )

    popular_dishes = models.JSONField(
        default=list,
        help_text='Array of popular dish names, e.g., ["Margherita Pizza", "Carbonara"]'
    )

    good_for = models.JSONField(
        default=list,
        help_text='Array of occasions, e.g., ["Birthdays", "Business Dinners", "Date Night"]'
    )

    # ========== Status Fields ==========
    is_open = models.BooleanField(
        default=True,
        db_index=True,  # For filtering by open/closed status
        help_text="Whether the restaurant is currently operating"
    )

    accepts_reservations = models.BooleanField(
        default=False,
        db_index=True,  # For reservation feature filtering
        help_text="Whether restaurant accepts reservations"
    )

    # ========== Ratings & Scores (Denormalized for performance) ==========
    # These are computed/aggregated from Reviews table and cached here

    rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)],
        db_index=True,  # For sorting by rating
        help_text="Overall rating (0.0-10.0)"
    )

    rating_count = models.IntegerField(
        default=0,
        help_text="Total number of ratings/reviews"
    )

    # Beli's unique triple-score system
    rec_score = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)],
        help_text="Recommendation score from critics/tastemakers"
    )

    rec_score_sample_size = models.IntegerField(
        default=0,
        help_text="Number of critic ratings contributing to rec_score"
    )

    friend_score = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)],
        help_text="Score from user's friends"
    )

    friend_score_sample_size = models.IntegerField(
        default=0,
        help_text="Number of friend ratings contributing to friend_score"
    )

    average_score = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)],
        help_text="Overall average score from all users"
    )

    average_score_sample_size = models.IntegerField(
        default=0,
        help_text="Number of all user ratings contributing to average_score"
    )

    # ========== Timestamps ==========
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,  # For "recently added" queries
        help_text="When this restaurant was added to the database"
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Last update timestamp"
    )

    # ========== Meta Configuration ==========
    class Meta:
        db_table = 'restaurants'
        ordering = ['-rating', 'name']  # Default ordering: highest rated first
        indexes = [
            # Composite index for common query: filter by city + sort by rating
            models.Index(fields=['city', '-rating'], name='city_rating_idx'),

            # Composite index for: filter by neighborhood + sort by rating
            models.Index(fields=['neighborhood', '-rating'], name='neighborhood_rating_idx'),

            # Composite index for: filter by cuisine (via GIN) + sort by rating
            # Note: GIN index on JSON field requires raw SQL (see migration)

            # Full-text search preparation (if not using ElasticSearch)
            # models.Index(fields=['name'], name='name_search_idx'),  # Already have db_index=True
        ]
        verbose_name = 'Restaurant'
        verbose_name_plural = 'Restaurants'

    def __str__(self):
        return f"{self.name} ({self.neighborhood}, {self.city})"

    def __repr__(self):
        return f"<Restaurant: {self.name} ({self.id})>"

    # ========== Helper Methods ==========

    @property
    def latitude(self):
        """Extract latitude from Point field."""
        return self.coordinates.y if self.coordinates else None

    @property
    def longitude(self):
        """Extract longitude from Point field."""
        return self.coordinates.x if self.coordinates else None

    def distance_from(self, lat, lng):
        """
        Calculate distance from a given point.
        Returns distance in miles.

        Args:
            lat: Latitude
            lng: Longitude

        Returns:
            Distance in miles (float)
        """
        from django.contrib.gis.geos import Point
        from django.contrib.gis.measure import Distance

        point = Point(lng, lat, srid=4326)
        distance_m = self.coordinates.distance(point)
        # Convert meters to miles
        return distance_m * 0.000621371

    def is_open_now(self):
        """
        Check if restaurant is currently open based on hours field.
        Note: This is a simplified implementation. Real version would:
        - Parse hours JSON
        - Get current day/time
        - Handle timezones

        Returns:
            Boolean indicating if open now (currently just returns is_open field)
        """
        # TODO: Implement actual hours parsing
        # For now, just return the is_open status field
        return self.is_open


class MenuItem(models.Model):
    """
    Menu items for restaurants.

    Separate table because:
    - Menus are complex entities (price, description, category)
    - Many items per restaurant (N:1 relationship)
    - Frequently queried independently (search for dishes)
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='menu_items',
        help_text="Restaurant this item belongs to"
    )

    name = models.CharField(
        max_length=255,
        db_index=True,  # For menu item search
        help_text="Dish name"
    )

    description = models.TextField(
        blank=True,
        help_text="Item description"
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Price in dollars"
    )

    category = models.CharField(
        max_length=50,
        choices=[
            ('appetizer', 'Appetizer'),
            ('entree', 'Entree'),
            ('side', 'Side'),
            ('dessert', 'Dessert'),
            ('drink', 'Drink'),
        ],
        db_index=True,  # For filtering by category
        help_text="Menu category"
    )

    image_url = models.URLField(
        blank=True,
        help_text="S3 URL for dish photo"
    )

    portion_size = models.CharField(
        max_length=20,
        choices=[
            ('small', 'Small'),
            ('medium', 'Medium'),
            ('large', 'Large'),
            ('shareable', 'Shareable'),
        ],
        default='medium',
        help_text="Portion size"
    )

    tags = models.JSONField(
        default=list,
        help_text='Tags like ["spicy", "vegetarian", "gluten-free"]'
    )

    popularity = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Popularity score (0-100)"
    )

    # Dietary info
    is_vegetarian = models.BooleanField(default=False, db_index=True)
    is_vegan = models.BooleanField(default=False, db_index=True)
    is_gluten_free = models.BooleanField(default=False, db_index=True)

    spice_level = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Spice level (1-5)"
    )

    meal_time = models.JSONField(
        default=list,
        help_text='Suitable meal times: ["breakfast", "lunch", "dinner", "any-time"]'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'menu_items'
        ordering = ['-popularity', 'name']
        indexes = [
            models.Index(fields=['restaurant', 'category'], name='restaurant_category_idx'),
            models.Index(fields=['restaurant', '-popularity'], name='restaurant_popularity_idx'),
        ]
        verbose_name = 'Menu Item'
        verbose_name_plural = 'Menu Items'

    def __str__(self):
        return f"{self.name} - {self.restaurant.name}"
