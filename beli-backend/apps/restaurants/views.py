"""
Restaurant API Views.

ViewSets provide CRUD operations + custom actions for restaurants.
"""

from django.contrib.gis.geos import Point
from django.contrib.gis.measure import Distance
from django.db.models import Q, F
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Restaurant, MenuItem
from .serializers import (
    RestaurantListSerializer,
    RestaurantDetailSerializer,
    RestaurantCreateUpdateSerializer,
    NearbyRestaurantSerializer,
    MenuItemSerializer,
)


class RestaurantPagination(PageNumberPagination):
    """Custom pagination for restaurants."""

    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class RestaurantViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Restaurant CRUD operations.

    Endpoints:
    - GET    /api/restaurants/          - List all restaurants
    - POST   /api/restaurants/          - Create restaurant (admin)
    - GET    /api/restaurants/{id}/     - Retrieve restaurant detail
    - PUT    /api/restaurants/{id}/     - Update restaurant (admin)
    - DELETE /api/restaurants/{id}/     - Delete restaurant (admin)
    - GET    /api/restaurants/search/   - Search with filters
    - GET    /api/restaurants/nearby/   - Nearby restaurants (geospatial)
    - GET    /api/restaurants/trending/ - Trending restaurants
    """

    queryset = Restaurant.objects.all()
    pagination_class = RestaurantPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

    # Filtering
    filterset_fields = ['category', 'price_range', 'city', 'neighborhood', 'is_open']

    # Search (full-text across multiple fields)
    search_fields = ['name', 'cuisine', 'tags', 'popular_dishes', 'neighborhood', 'address']

    # Sorting
    ordering_fields = ['name', 'rating', 'created_at', 'rating_count']
    ordering = ['-rating']  # Default: highest rated first

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list' or self.action == 'search' or self.action == 'trending':
            return RestaurantListSerializer
        elif self.action == 'retrieve':
            return RestaurantDetailSerializer
        elif self.action == 'nearby':
            return NearbyRestaurantSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return RestaurantCreateUpdateSerializer
        return RestaurantDetailSerializer

    def get_queryset(self):
        """
        Optimize queryset based on action.

        - list/search: No joins needed (single table)
        - retrieve: Prefetch menu items to avoid N+1
        """
        queryset = Restaurant.objects.all()

        if self.action == 'retrieve':
            # Prefetch menu items for detail view (avoid N+1 query)
            queryset = queryset.prefetch_related('menu_items')

        return queryset

    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        """
        Advanced search with multiple filters.

        Query Params:
            ?q=pizza                  - Text search
            ?cuisine=Italian          - Filter by cuisine (JSON array)
            ?price_range=$$           - Filter by price
            ?city=New York            - Filter by city
            ?neighborhood=SoHo        - Filter by neighborhood
            ?category=restaurants     - Filter by category
            ?is_open=true             - Filter by open status
            ?min_rating=7.5           - Minimum rating
            ?ordering=-rating         - Sort order

        Example: /api/restaurants/search/?q=pizza&city=New%20York&min_rating=8.0
        """
        queryset = self.filter_queryset(self.get_queryset())

        # Additional filters not covered by filterset_fields

        # Filter by cuisine (JSON field contains)
        cuisine_param = request.query_params.get('cuisine', None)
        if cuisine_param:
            queryset = queryset.filter(cuisine__contains=[cuisine_param])

        # Filter by minimum rating
        min_rating = request.query_params.get('min_rating', None)
        if min_rating:
            try:
                queryset = queryset.filter(rating__gte=float(min_rating))
            except ValueError:
                pass

        # Filter by tags (JSON field overlap)
        tags_param = request.query_params.get('tags', None)
        if tags_param:
            tag_list = tags_param.split(',')
            # Filter restaurants that have ANY of the specified tags
            queryset = queryset.filter(tags__overlap=tag_list)

        # Paginate
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='nearby')
    def nearby(self, request):
        """
        Find restaurants near a location (geospatial query).

        Query Params (required):
            lat     - Latitude (e.g., 40.7580)
            lng     - Longitude (e.g., -73.9855)

        Query Params (optional):
            radius  - Search radius in miles (default: 2.0)
            limit   - Max results (default: 20)
            min_rating - Minimum rating (default: 0.0)

        Example: /api/restaurants/nearby/?lat=40.7580&lng=-73.9855&radius=1.5&min_rating=7.5

        Returns: GeoJSON FeatureCollection with restaurants sorted by distance
        """
        # Get parameters
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius_miles = float(request.query_params.get('radius', 2.0))
        limit = int(request.query_params.get('limit', 20))
        min_rating = float(request.query_params.get('min_rating', 0.0))

        # Validate required params
        if not lat or not lng:
            return Response(
                {'error': 'Missing required parameters: lat and lng'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            lat = float(lat)
            lng = float(lng)
        except ValueError:
            return Response(
                {'error': 'Invalid lat/lng values. Must be numbers.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create Point for user location
        user_location = Point(lng, lat, srid=4326)

        # PostGIS distance query
        # Distance() uses meters internally, convert miles to meters
        radius_meters = radius_miles * 1609.34

        queryset = Restaurant.objects.filter(
            coordinates__distance_lte=(user_location, Distance(m=radius_meters)),
            rating__gte=min_rating,
            is_open=True,  # Only show open restaurants
        ).annotate(
            distance=F('coordinates__distance') * 0.000621371  # Convert meters to miles
        ).order_by('distance')[:limit]

        # Serialize to GeoJSON
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='trending')
    def trending(self, request):
        """
        Get trending restaurants.

        For now, returns highest-rated restaurants with many reviews.
        In production, would analyze recent activity from feed.

        Query Params:
            limit - Number of results (default: 10)

        Example: /api/restaurants/trending/?limit=20
        """
        limit = int(request.query_params.get('limit', 10))

        # Trending algorithm (simplified):
        # High rating + Many recent reviews = Trending
        # In production: Analyze FeedItem table for recent activity
        queryset = Restaurant.objects.filter(
            rating__gte=7.5,
            rating_count__gte=10,
        ).order_by('-rating_count', '-rating')[:limit]

        serializer = RestaurantListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='menu')
    def menu(self, request, pk=None):
        """
        Get full menu for a restaurant.

        Returns all menu items grouped by category.

        Example: /api/restaurants/{id}/menu/
        """
        restaurant = self.get_object()
        menu_items = restaurant.menu_items.all()

        serializer = MenuItemSerializer(menu_items, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='recommendations')
    def recommendations(self, request, pk=None):
        """
        Get recommended restaurants similar to this one.

        Based on:
        - Same cuisine
        - Same neighborhood or nearby
        - Similar rating
        - Similar price range

        Example: /api/restaurants/{id}/recommendations/
        """
        restaurant = self.get_object()

        # Find similar restaurants
        similar = Restaurant.objects.filter(
            cuisine__overlap=restaurant.cuisine,  # Share at least one cuisine
            city=restaurant.city,  # Same city
            rating__gte=restaurant.rating - 1.0,  # Within 1 point
            rating__lte=restaurant.rating + 1.0,
        ).exclude(
            id=restaurant.id  # Exclude this restaurant
        ).order_by('-rating')[:10]

        serializer = RestaurantListSerializer(similar, many=True)
        return Response(serializer.data)


class MenuItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for MenuItem CRUD operations.

    Endpoints:
    - GET    /api/menu-items/          - List menu items
    - POST   /api/menu-items/          - Create menu item (admin)
    - GET    /api/menu-items/{id}/     - Retrieve menu item
    - PUT    /api/menu-items/{id}/     - Update menu item (admin)
    - DELETE /api/menu-items/{id}/     - Delete menu item (admin)
    """

    queryset = MenuItem.objects.select_related('restaurant').all()
    serializer_class = MenuItemSerializer
    pagination_class = RestaurantPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

    filterset_fields = [
        'restaurant',
        'category',
        'portion_size',
        'is_vegetarian',
        'is_vegan',
        'is_gluten_free',
    ]

    search_fields = ['name', 'description', 'tags']
    ordering_fields = ['name', 'price', 'popularity']
    ordering = ['-popularity', 'name']

    @action(detail=False, methods=['get'], url_path='popular')
    def popular(self, request):
        """
        Get most popular menu items across all restaurants.

        Query Params:
            limit - Number of results (default: 20)
            category - Filter by category (optional)

        Example: /api/menu-items/popular/?category=entree&limit=10
        """
        limit = int(request.query_params.get('limit', 20))
        category = request.query_params.get('category', None)

        queryset = MenuItem.objects.select_related('restaurant').filter(
            popularity__gte=70
        )

        if category:
            queryset = queryset.filter(category=category)

        queryset = queryset.order_by('-popularity')[:limit]

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
