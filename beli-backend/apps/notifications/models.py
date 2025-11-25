"""
Notifications models.
"""
import uuid
from django.db import models


class Notification(models.Model):
    """
    User notification.
    """
    TYPE_CHOICES = [
        ('rating_liked', 'Rating Liked'),
        ('bookmark_liked', 'Bookmark Liked'),
        ('comment', 'Comment'),
        ('follow', 'Follow'),
        ('list_bookmark', 'List Bookmark'),
        ('streak', 'Streak'),
        ('recommendation', 'Recommendation'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='notifications',
        db_column='user_id'
    )
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    actor_user = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='caused_notifications',
        db_column='actor_user_id'
    )
    target_restaurant = models.ForeignKey(
        'restaurants.Restaurant',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='target_restaurant_id'
    )
    target_list = models.CharField(max_length=200, blank=True, null=True)
    comment_text = models.TextField(blank=True, null=True)
    streak_count = models.IntegerField(blank=True, null=True)
    action_description = models.CharField(max_length=500)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
