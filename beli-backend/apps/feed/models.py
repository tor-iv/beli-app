"""
Feed models - Activity interactions (likes, bookmarks, comments).

The feed itself is generated from ratings table, but interactions
are stored separately.
"""
import uuid
from django.db import models


class ActivityInteraction(models.Model):
    """
    Stores likes and bookmarks for feed activities (ratings).
    """
    INTERACTION_TYPES = [
        ('like', 'Like'),
        ('bookmark', 'Bookmark'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='activity_interactions',
        db_column='user_id'
    )
    rating = models.ForeignKey(
        'users.Rating',
        on_delete=models.CASCADE,
        related_name='interactions',
        db_column='rating_id'
    )
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # This table may not exist yet - we'll create it
        db_table = 'activity_interactions'
        unique_together = ('user', 'rating', 'interaction_type')


class ActivityComment(models.Model):
    """
    Comments on feed activities.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='activity_comments',
        db_column='user_id'
    )
    rating = models.ForeignKey(
        'users.Rating',
        on_delete=models.CASCADE,
        related_name='comments',
        db_column='rating_id'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_comments'
        ordering = ['created_at']
