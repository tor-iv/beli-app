"""
User models - maps to existing Supabase 'users' and 'user_follows' tables.

Uses managed=False to prevent Django from modifying the table structure.
"""
import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField


class User(models.Model):
    """
    User model matching Supabase users table exactly.

    Note: This is NOT Django's auth user - it's a custom model for the API.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=50, unique=True)
    display_name = models.CharField(max_length=100)
    avatar = models.URLField(max_length=500, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    # Location
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=50, blank=True, null=True)

    # Tastemaker status
    is_tastemaker = models.BooleanField(default=False)

    # Watchlist (want-to-try restaurants)
    # This is the source of truth for want-to-try list
    watchlist = ArrayField(
        models.UUIDField(),
        default=list,
        blank=True
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False  # Don't let Django manage this table
        db_table = 'users'

    def __str__(self):
        return f"@{self.username}"


class UserFollow(models.Model):
    """
    User follow relationships - maps to Supabase user_follows table.
    """
    follower = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='following_set',
        db_column='follower_id'
    )
    following = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='followers_set',
        db_column='following_id'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False  # Don't let Django manage this table
        db_table = 'user_follows'
        unique_together = ('follower', 'following')

    def __str__(self):
        return f"{self.follower.username} -> {self.following.username}"


class Rating(models.Model):
    """
    User-restaurant relationship - maps to Supabase ratings table.

    Stores 'been' and 'recommended' status.
    Note: 'want_to_try' is deprecated - use users.watchlist instead.
    """
    STATUS_CHOICES = [
        ('been', 'Been'),
        ('want_to_try', 'Want to Try'),  # Deprecated
        ('recommended', 'Recommended'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='ratings',
        db_column='user_id'
    )
    restaurant = models.ForeignKey(
        'restaurants.Restaurant',
        on_delete=models.CASCADE,
        related_name='ratings',
        db_column='restaurant_id'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    rating = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True)
    rank_index = models.IntegerField(blank=True, null=True)

    # Review content
    notes = models.TextField(blank=True, null=True)
    photos = ArrayField(models.URLField(max_length=500), default=list)
    tags = ArrayField(models.CharField(max_length=50), default=list)

    # Visit metadata
    visit_date = models.DateField(blank=True, null=True)
    companions = ArrayField(models.UUIDField(), default=list)  # User IDs

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False  # Don't let Django manage this table
        db_table = 'ratings'
        unique_together = ('user', 'restaurant')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.restaurant.name} ({self.status})"
