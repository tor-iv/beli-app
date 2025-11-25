"""
Lists models - User-created restaurant lists.
"""
import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField


class List(models.Model):
    """
    User-created restaurant list.
    Matches TypeScript List type.
    """
    CATEGORY_CHOICES = [
        ('restaurants', 'Restaurants'),
        ('bars', 'Bars'),
        ('bakeries', 'Bakeries'),
        ('coffee_tea', 'Coffee & Tea'),
        ('dessert', 'Dessert'),
        ('other', 'Other'),
    ]

    SCOPE_CHOICES = [
        ('been', 'Been'),
        ('want_to_try', 'Want to Try'),
        ('recs', 'Recommendations'),
        ('playlists', 'Playlists'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='lists',
        db_column='user_id'
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    restaurants = ArrayField(models.UUIDField(), default=list)
    is_public = models.BooleanField(default=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='restaurants')
    list_type = models.CharField(max_length=20, choices=SCOPE_CHOICES, default='playlists')
    thumbnail_image = models.URLField(max_length=500, blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lists'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} by {self.user.username}"
