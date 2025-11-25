"""
Menu services - Order suggestion algorithm.

Matches the TypeScript MenuService.generateOrderSuggestion() implementation.
"""
import uuid
from .models import MenuItem


class OrderSuggestionService:
    """
    AI-powered order suggestion generator.

    Considers party size, hunger level, and dietary restrictions
    to suggest optimal menu items.
    """

    HUNGER_MULTIPLIERS = {
        'light': 0.8,
        'moderate': 1.2,
        'very-hungry': 1.8,
    }

    PORTION_POINTS = {
        'small': 5,
        'medium': 10,
        'large': 15,
        'shareable': 12,
    }

    @classmethod
    def generate_suggestion(
        cls,
        restaurant_id: str,
        party_size: int,
        hunger_level: str = 'moderate',
        meal_time: str = 'dinner',
        dietary_restrictions: list = None
    ) -> dict:
        """
        Generate personalized order suggestion.

        Args:
            restaurant_id: Restaurant UUID
            party_size: Number of people
            hunger_level: 'light', 'moderate', or 'very-hungry'
            meal_time: 'breakfast', 'lunch', 'dinner', or 'any-time'
            dietary_restrictions: List of dietary restrictions

        Returns:
            OrderSuggestion dict with items and reasoning
        """
        menu_items = list(MenuItem.objects.filter(restaurant_id=restaurant_id))

        if not menu_items:
            return {
                'id': str(uuid.uuid4()),
                'restaurantId': restaurant_id,
                'partySize': party_size,
                'hungerLevel': hunger_level,
                'mealTime': meal_time,
                'items': [],
                'totalPrice': 0,
                'reasoning': ['No menu available for this restaurant'],
                'estimatedSharability': 'Unknown',
            }

        dietary_restrictions = dietary_restrictions or []

        # Filter by dietary restrictions
        filtered_menu = menu_items
        if 'vegetarian' in dietary_restrictions:
            filtered_menu = [
                m for m in filtered_menu
                if 'vegetarian' in (m.dietary_info or [])
            ]
        if 'gluten-free' in dietary_restrictions:
            filtered_menu = [
                m for m in filtered_menu
                if 'gluten-free' in (m.dietary_info or [])
            ]

        # If filtering removed all items, use original
        if not filtered_menu:
            filtered_menu = menu_items

        # Separate by category
        appetizers = [m for m in filtered_menu if m.category == 'appetizer']
        entrees = [m for m in filtered_menu if m.category == 'entree']
        sides = [m for m in filtered_menu if m.category == 'side']
        desserts = [m for m in filtered_menu if m.category == 'dessert']
        drinks = [m for m in filtered_menu if m.category == 'drink']

        # Sort by popularity
        appetizers.sort(key=lambda x: x.is_popular, reverse=True)
        entrees.sort(key=lambda x: x.is_popular, reverse=True)
        sides.sort(key=lambda x: x.is_popular, reverse=True)
        desserts.sort(key=lambda x: x.is_popular, reverse=True)

        selected_items = []
        reasoning = []

        # Selection logic based on party size and hunger
        if party_size == 1:
            if hunger_level == 'light':
                if appetizers:
                    selected_items.append({'item': appetizers[0], 'quantity': 1})
                reasoning.append('Perfect light bite for one')
            elif hunger_level == 'moderate':
                if entrees:
                    selected_items.append({'item': entrees[0], 'quantity': 1})
                if appetizers:
                    selected_items.append({'item': appetizers[0], 'quantity': 1})
                reasoning.append('Great portions for one person')
            else:  # very-hungry
                if appetizers:
                    selected_items.append({'item': appetizers[0], 'quantity': 1})
                if entrees:
                    selected_items.append({'item': entrees[0], 'quantity': 1})
                if desserts:
                    selected_items.append({'item': desserts[0], 'quantity': 1})
                reasoning.append('Satisfying meal for a big appetite')
        else:
            # Group ordering logic
            num_apps = min(len(appetizers), (party_size // 2) + 1)
            num_entrees = min(len(entrees), party_size)

            for i in range(num_apps):
                selected_items.append({'item': appetizers[i], 'quantity': 1})

            for i in range(num_entrees):
                selected_items.append({'item': entrees[i], 'quantity': 1})

            if hunger_level == 'very-hungry':
                if sides:
                    num_sides = min(len(sides), party_size // 2)
                    for i in range(num_sides):
                        selected_items.append({'item': sides[i], 'quantity': 1})
                if desserts:
                    selected_items.append({'item': desserts[0], 'quantity': 1})

            reasoning.append(f'Family-style sharing for {party_size} people')

        # Calculate total price
        total_price = sum(
            float(item['item'].price or 0) * item['quantity']
            for item in selected_items
        )

        # Sharability estimate
        if party_size == 1:
            sharability = 'Individual portions'
        else:
            sharability = f'Ideal for your group of {party_size}'

        return {
            'id': str(uuid.uuid4()),
            'restaurantId': restaurant_id,
            'partySize': party_size,
            'hungerLevel': hunger_level,
            'mealTime': meal_time,
            'items': [
                {
                    'id': str(item['item'].id),
                    'name': item['item'].name,
                    'description': item['item'].description,
                    'price': float(item['item'].price or 0),
                    'category': item['item'].category,
                    'quantity': item['quantity'],
                }
                for item in selected_items
            ],
            'totalPrice': round(total_price, 2),
            'reasoning': reasoning,
            'estimatedSharability': sharability,
        }
