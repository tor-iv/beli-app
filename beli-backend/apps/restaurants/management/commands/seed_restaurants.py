"""
Management command to seed restaurants from frontend mock data.

Usage:
    python manage.py seed_restaurants
"""

from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from apps.restaurants.models import Restaurant, MenuItem
import random


class Command(BaseCommand):
    help = 'Seeds the database with sample restaurants'

    def handle(self, *args, **options):
        self.stdout.write('Seeding restaurants...')

        # Sample data based on your mock data structure
        restaurants_data = [
            {
                'name': "Joe's Pizza",
                'cuisine': ['Italian', 'Pizza'],
                'category': 'restaurants',
                'price_range': '$',
                'address': '7 Carmine St',
                'city': 'New York',
                'state': 'NY',
                'neighborhood': 'Greenwich Village',
                'lat': 40.7308,
                'lng': -74.0023,
                'phone': '(212) 366-1182',
                'website': 'https://joespizzanyc.com',
                'hours': {
                    'monday': '10:00 AM - 4:00 AM',
                    'tuesday': '10:00 AM - 4:00 AM',
                    'wednesday': '10:00 AM - 4:00 AM',
                    'thursday': '10:00 AM - 4:00 AM',
                    'friday': '10:00 AM - 5:00 AM',
                    'saturday': '10:00 AM - 5:00 AM',
                    'sunday': '10:00 AM - 4:00 AM',
                },
                'tags': ['iconic', 'late-night', 'cash-only'],
                'popular_dishes': ['Plain Cheese Slice', 'Pepperoni Slice', 'Sicilian Slice'],
                'good_for': ['Quick Bite', 'Late Night', 'Casual Dining'],
                'rating': 8.7,
                'rating_count': 1247,
                'rec_score': 9.2,
                'friend_score': 8.5,
                'average_score': 8.7,
                'is_open': True,
                'accepts_reservations': False,
            },
            {
                'name': 'Le Bernardin',
                'cuisine': ['French', 'Seafood', 'Fine Dining'],
                'category': 'restaurants',
                'price_range': '$$$$',
                'address': '155 W 51st St',
                'city': 'New York',
                'state': 'NY',
                'neighborhood': 'Midtown',
                'lat': 40.7614,
                'lng': -73.9776,
                'phone': '(212) 554-1515',
                'website': 'https://le-bernardin.com',
                'hours': {
                    'monday': '5:00 PM - 10:00 PM',
                    'tuesday': '5:00 PM - 10:00 PM',
                    'wednesday': '5:00 PM - 10:00 PM',
                    'thursday': '5:00 PM - 10:00 PM',
                    'friday': '5:00 PM - 10:30 PM',
                    'saturday': '5:00 PM - 10:30 PM',
                    'sunday': 'Closed',
                },
                'tags': ['michelin-star', 'romantic', 'special-occasion', 'business-dining'],
                'popular_dishes': ['Tuna Carpaccio', 'Black Bass', 'Dover Sole'],
                'good_for': ['Special Occasion', 'Business Dinners', 'Date Night', 'Celebrations'],
                'rating': 9.6,
                'rating_count': 892,
                'rec_score': 9.8,
                'friend_score': 9.4,
                'average_score': 9.6,
                'is_open': True,
                'accepts_reservations': True,
            },
            {
                'name': 'Shake Shack',
                'cuisine': ['American', 'Burgers', 'Fast Food'],
                'category': 'restaurants',
                'price_range': '$$',
                'address': 'Multiple Locations',
                'city': 'New York',
                'state': 'NY',
                'neighborhood': 'Madison Square Park',
                'lat': 40.7414,
                'lng': -73.9882,
                'phone': '(212) 889-6600',
                'website': 'https://shakeshack.com',
                'hours': {
                    'monday': '11:00 AM - 11:00 PM',
                    'tuesday': '11:00 AM - 11:00 PM',
                    'wednesday': '11:00 AM - 11:00 PM',
                    'thursday': '11:00 AM - 11:00 PM',
                    'friday': '11:00 AM - 12:00 AM',
                    'saturday': '11:00 AM - 12:00 AM',
                    'sunday': '11:00 AM - 11:00 PM',
                },
                'tags': ['casual', 'family-friendly', 'outdoor-seating'],
                'popular_dishes': ['ShackBurger', 'Crinkle Cut Fries', 'Concrete'],
                'good_for': ['Casual Dining', 'Quick Bite', 'Families'],
                'rating': 8.2,
                'rating_count': 2145,
                'rec_score': 8.0,
                'friend_score': 8.3,
                'average_score': 8.2,
                'is_open': True,
                'accepts_reservations': False,
            },
            {
                'name': 'Momofuku Noodle Bar',
                'cuisine': ['Asian', 'Ramen', 'Japanese'],
                'category': 'restaurants',
                'price_range': '$$',
                'address': '171 1st Ave',
                'city': 'New York',
                'state': 'NY',
                'neighborhood': 'East Village',
                'lat': 40.7298,
                'lng': -73.9865,
                'phone': '(212) 777-7773',
                'website': 'https://momofuku.com',
                'hours': {
                    'monday': '5:00 PM - 11:00 PM',
                    'tuesday': '5:00 PM - 11:00 PM',
                    'wednesday': '5:00 PM - 11:00 PM',
                    'thursday': '5:00 PM - 11:00 PM',
                    'friday': '5:00 PM - 12:00 AM',
                    'saturday': '11:00 AM - 12:00 AM',
                    'sunday': '11:00 AM - 11:00 PM',
                },
                'tags': ['trendy', 'innovative', 'group-friendly'],
                'popular_dishes': ['Pork Buns', 'Ramen', 'Ginger Scallion Noodles'],
                'good_for': ['Date Night', 'Groups', 'Casual Dining'],
                'rating': 8.9,
                'rating_count': 1567,
                'rec_score': 9.1,
                'friend_score': 8.7,
                'average_score': 8.9,
                'is_open': True,
                'accepts_reservations': True,
            },
            {
                'name': 'Blue Bottle Coffee',
                'cuisine': ['Coffee', 'Cafe', 'Bakery'],
                'category': 'coffee_tea',
                'price_range': '$$',
                'address': 'Multiple Locations',
                'city': 'New York',
                'state': 'NY',
                'neighborhood': 'Williamsburg',
                'lat': 40.7195,
                'lng': -73.9573,
                'phone': '(510) 653-3394',
                'website': 'https://bluebottlecoffee.com',
                'hours': {
                    'monday': '7:00 AM - 7:00 PM',
                    'tuesday': '7:00 AM - 7:00 PM',
                    'wednesday': '7:00 AM - 7:00 PM',
                    'thursday': '7:00 AM - 7:00 PM',
                    'friday': '7:00 AM - 8:00 PM',
                    'saturday': '8:00 AM - 8:00 PM',
                    'sunday': '8:00 AM - 7:00 PM',
                },
                'tags': ['third-wave-coffee', 'minimalist', 'work-friendly'],
                'popular_dishes': ['New Orleans Iced Coffee', 'Cappuccino', 'Pastries'],
                'good_for': ['Working', 'Quick Coffee', 'Meeting'],
                'rating': 8.4,
                'rating_count': 987,
                'rec_score': 8.6,
                'friend_score': 8.2,
                'average_score': 8.4,
                'is_open': True,
                'accepts_reservations': False,
            },
        ]

        created_count = 0
        for data in restaurants_data:
            # Extract lat/lng and create Point
            lat = data.pop('lat')
            lng = data.pop('lng')
            coordinates = Point(lng, lat, srid=4326)

            # Create restaurant
            restaurant, created = Restaurant.objects.get_or_create(
                name=data['name'],
                defaults={
                    **data,
                    'coordinates': coordinates,
                }
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created: {restaurant.name}')
                )

                # Create sample menu items for each restaurant
                self._create_sample_menu_items(restaurant)
            else:
                self.stdout.write(
                    self.style.WARNING(f'- Already exists: {restaurant.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\n✓ Successfully seeded {created_count} restaurants!')
        )

    def _create_sample_menu_items(self, restaurant):
        """Create sample menu items for a restaurant."""

        # Sample menu items based on restaurant type
        if 'Pizza' in restaurant.cuisine:
            items = [
                {
                    'name': 'Margherita Pizza',
                    'description': 'Classic tomato, mozzarella, and basil',
                    'price': 18.00,
                    'category': 'entree',
                    'portion_size': 'large',
                    'popularity': 95,
                    'is_vegetarian': True,
                },
                {
                    'name': 'Pepperoni Pizza',
                    'description': 'Tomato sauce, mozzarella, and pepperoni',
                    'price': 20.00,
                    'category': 'entree',
                    'portion_size': 'large',
                    'popularity': 98,
                },
            ]
        elif 'Burgers' in restaurant.cuisine:
            items = [
                {
                    'name': 'Classic Burger',
                    'description': 'Beef patty, lettuce, tomato, pickles',
                    'price': 12.00,
                    'category': 'entree',
                    'portion_size': 'medium',
                    'popularity': 90,
                },
                {
                    'name': 'French Fries',
                    'description': 'Crispy golden fries',
                    'price': 5.00,
                    'category': 'side',
                    'portion_size': 'small',
                    'popularity': 85,
                    'is_vegetarian': True,
                },
            ]
        elif 'Ramen' in restaurant.cuisine:
            items = [
                {
                    'name': 'Tonkotsu Ramen',
                    'description': 'Pork broth, chashu, egg, scallions',
                    'price': 16.00,
                    'category': 'entree',
                    'portion_size': 'large',
                    'popularity': 92,
                },
                {
                    'name': 'Pork Buns',
                    'description': 'Steamed buns with braised pork belly',
                    'price': 12.00,
                    'category': 'appetizer',
                    'portion_size': 'shareable',
                    'popularity': 97,
                },
            ]
        else:
            items = [
                {
                    'name': 'House Special',
                    'description': 'Chef\'s signature dish',
                    'price': 25.00,
                    'category': 'entree',
                    'portion_size': 'medium',
                    'popularity': 88,
                },
            ]

        for item_data in items:
            MenuItem.objects.create(
                restaurant=restaurant,
                **item_data,
                tags=['popular'],
                meal_time=['lunch', 'dinner'],
            )
