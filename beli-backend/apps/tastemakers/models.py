"""
Tastemakers models - Expert profiles and posts.
"""
import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField


class TastemakerPost(models.Model):
    """
    Tastemaker article/post.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='tastemaker_posts',
        db_column='user_id'
    )
    title = models.CharField(max_length=300)
    subtitle = models.CharField(max_length=500, blank=True, null=True)
    cover_image = models.URLField(max_length=500)
    content = models.TextField()  # Markdown/rich text

    # Related content
    restaurant_ids = ArrayField(models.UUIDField(), default=list)
    list_ids = ArrayField(models.UUIDField(), default=list)
    tags = ArrayField(models.CharField(max_length=50), default=list)

    # Publishing
    is_featured = models.BooleanField(default=False)
    published_at = models.DateTimeField()
    updated_at = models.DateTimeField(auto_now=True)

    # Engagement
    view_count = models.IntegerField(default=0)

    class Meta:
        db_table = 'tastemaker_posts'
        ordering = ['-published_at']


class TastemakerPostInteraction(models.Model):
    """
    Likes and bookmarks on tastemaker posts.
    """
    INTERACTION_TYPES = [
        ('like', 'Like'),
        ('bookmark', 'Bookmark'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        db_column='user_id'
    )
    post = models.ForeignKey(
        TastemakerPost,
        on_delete=models.CASCADE,
        related_name='interactions',
        db_column='post_id'
    )
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tastemaker_post_interactions'
        unique_together = ('user', 'post', 'interaction_type')
