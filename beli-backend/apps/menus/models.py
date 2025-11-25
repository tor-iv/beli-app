"""
Menus models - Restaurant menu items.
"""
import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField


class MenuItem(models.Model):
    """
    Restaurant menu item matching Supabase menu_items table.
    """
    CATEGORY_CHOICES = [
        ('appetizer', 'Appetizer'),
        ('entree', 'Entree'),
        ('side', 'Side'),
        ('dessert', 'Dessert'),
        ('drink', 'Drink'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey(
        'restaurants.Restaurant',
        on_delete=models.CASCADE,
        related_name='menu_items',
        db_column='restaurant_id'
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, blank=True, null=True)
    is_popular = models.BooleanField(default=False)
    dietary_info = ArrayField(models.CharField(max_length=50), default=list)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False  # Table exists in Supabase
        db_table = 'menu_items'
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} (${self.price})"
