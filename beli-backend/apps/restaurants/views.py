"""
Restaurant API views.

Provides REST endpoints for restaurant data, matching the frontend
RestaurantService methods.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Restaurant
from .serializers import (
    RestaurantSerializer,
    RestaurantListSerializer,
)


class RestaurantViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for restaurants.

    Supports:
    - GET /api/v1/restaurants/ - List all restaurants
    - GET /api/v1/restaurants/{id}/ - Get single restaurant
    - GET /api/v1/restaurants/search/ - Search restaurants
    - GET /api/v1/restaurants/trending/ - Get trending restaurants
    - POST /api/v1/restaurants/batch/ - Get multiple by IDs
    """
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'cuisine', 'neighborhood', 'tags']
    ordering_fields = ['rating', 'name', 'created_at']
    ordering = ['-rating']

    def get_serializer_class(self):
        """Use lightweight serializer for list views."""
        if self.action == 'list':
            return RestaurantListSerializer
        return RestaurantSerializer

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Search restaurants with filters.

        Maps to: RestaurantService.searchRestaurants()

        Query params:
        - q: Search query (name, cuisine, neighborhood)
        - cuisine: Filter by cuisine (can be comma-separated)
        - priceRange: Filter by price range
        - neighborhood: Filter by neighborhood
        - category: Filter by category
        - isOpen: Filter by open status

        Note: cuisine, tags are stored as JSONB arrays in Supabase.
        We use icontains for simple text matching within the JSON.
        """
        queryset = self.get_queryset()

        # Text search - use icontains for JSONB fields
        query = request.query_params.get('q', '')
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(neighborhood__icontains=query)
            )
            # For JSONB arrays, we can't use direct contains
            # Instead, filter after fetching (or use raw SQL)
            # For now, keep it simple with name/neighborhood match

        # Cuisine filter - use icontains for JSONB text search
        # Django's JSONField __contains doesn't work well with array elements,
        # so we use icontains which searches within the JSON text representation
        cuisines = request.query_params.get('cuisine', '')
        if cuisines:
            cuisine_list = [c.strip() for c in cuisines.split(',')]
            # Build Q objects for each cuisine (OR logic)
            cuisine_q = Q()
            for cuisine in cuisine_list:
                # This searches for the cuisine string within the JSONB text
                cuisine_q |= Q(cuisine__icontains=cuisine)
            queryset = queryset.filter(cuisine_q)

        # Price range filter
        price_range = request.query_params.get('priceRange', '')
        if price_range:
            price_list = price_range.split(',')
            queryset = queryset.filter(price_range__in=price_list)

        # Neighborhood filter
        neighborhood = request.query_params.get('neighborhood', '')
        if neighborhood:
            queryset = queryset.filter(neighborhood__icontains=neighborhood)

        # Category filter
        category = request.query_params.get('category', '')
        if category:
            queryset = queryset.filter(category=category)

        # Open status filter
        is_open = request.query_params.get('isOpen', '')
        if is_open.lower() == 'true':
            queryset = queryset.filter(is_open=True)

        serializer = RestaurantListSerializer(queryset[:50], many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def trending(self, request):
        """
        Get trending restaurants (high rated, recent activity).

        Maps to: RestaurantService.getTrendingRestaurants()
        """
        limit = int(request.query_params.get('limit', 10))
        queryset = self.get_queryset().filter(
            rating__gte=7.5
        ).order_by('-rating', '-rating_count')[:limit]

        serializer = RestaurantListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def batch(self, request):
        """
        Get multiple restaurants by IDs.

        Maps to: RestaurantService.getRestaurantsByIds()

        Request body: { "ids": ["uuid1", "uuid2", ...] }
        """
        ids = request.data.get('ids', [])
        if not ids:
            return Response([], status=status.HTTP_200_OK)

        queryset = self.get_queryset().filter(id__in=ids)
        serializer = RestaurantSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def random(self, request):
        """
        Get random restaurants.

        Maps to: RestaurantService.getRandomRestaurants()
        """
        count = int(request.query_params.get('count', 5))
        queryset = self.get_queryset().order_by('?')[:count]

        serializer = RestaurantListSerializer(queryset, many=True)
        return Response(serializer.data)
