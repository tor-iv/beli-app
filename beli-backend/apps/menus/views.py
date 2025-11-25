"""
Menus API views.

Provides REST endpoints for restaurant menus and order suggestions.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import MenuItem
from .serializers import MenuItemSerializer, OrderSuggestionRequestSerializer
from .services import OrderSuggestionService


class MenusViewSet(viewsets.ViewSet):
    """
    API endpoint for menus.

    Supports:
    - GET /api/v1/menus/restaurant/{restaurantId}/ - Get restaurant menu
    - POST /api/v1/menus/suggest/ - Generate order suggestion
    """

    @action(detail=False, methods=['get'], url_path='restaurant/(?P<restaurant_id>[^/.]+)')
    def restaurant_menu(self, request, restaurant_id=None):
        """
        Get menu for a restaurant.

        Maps to: MenuService.getRestaurantMenu()
        """
        menu_items = MenuItem.objects.filter(
            restaurant_id=restaurant_id
        ).order_by('category', '-is_popular', 'name')

        serializer = MenuItemSerializer(menu_items, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def suggest(self, request):
        """
        Generate order suggestion based on party size and hunger level.

        Maps to: MenuService.generateOrderSuggestion()
        """
        serializer = OrderSuggestionRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        suggestion = OrderSuggestionService.generate_suggestion(
            restaurant_id=str(data['restaurantId']),
            party_size=data['partySize'],
            hunger_level=data['hungerLevel'],
            meal_time=data['mealTime'],
            dietary_restrictions=data.get('dietaryRestrictions', []),
        )

        return Response(suggestion)
