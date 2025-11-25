"""
Group Dinner models - Sessions and reservations.
"""
import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField


class GroupDinnerSession(models.Model):
    """
    Group dinner planning session.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='group_dinner_sessions',
        db_column='user_id'
    )
    participants = ArrayField(models.UUIDField(), default=list)
    selected_restaurant = models.ForeignKey(
        'restaurants.Restaurant',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='selected_restaurant_id'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'group_dinner_sessions'


class Reservation(models.Model):
    """
    Restaurant reservation.
    """
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('claimed', 'Claimed'),
        ('shared', 'Shared'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey(
        'restaurants.Restaurant',
        on_delete=models.CASCADE,
        related_name='reservations',
        db_column='restaurant_id'
    )
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='reservations',
        db_column='user_id'
    )
    date_time = models.DateTimeField()
    party_size = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    claimed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='claimed_reservations',
        db_column='claimed_by_id'
    )
    shared_with = ArrayField(models.UUIDField(), default=list)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reservations'
        ordering = ['date_time']
