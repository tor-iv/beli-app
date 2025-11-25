"""
Lists API views.

Provides REST endpoints for user lists, matching ListService methods.
"""
import uuid
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import List
from .serializers import ListSerializer, ListCreateSerializer, ListUpdateSerializer
from apps.restaurants.models import Restaurant
from apps.restaurants.serializers import RestaurantListSerializer


class ListsViewSet(viewsets.ViewSet):
    """
    API endpoint for user lists.

    Supports:
    - GET /api/v1/lists/user/{userId}/ - Get user's lists
    - GET /api/v1/lists/featured/ - Get featured lists
    - GET /api/v1/lists/{id}/ - Get single list
    - POST /api/v1/lists/ - Create list
    - PATCH /api/v1/lists/{id}/ - Update list
    - DELETE /api/v1/lists/{id}/ - Delete list
    - POST /api/v1/lists/{id}/add/ - Add restaurant to list
    - POST /api/v1/lists/{id}/remove/ - Remove restaurant from list
    """

    def list(self, request):
        """
        Get all lists (admin view).

        Note: Returns empty array if lists table doesn't exist in Supabase.
        """
        try:
            lists = List.objects.all().order_by('-created_at')[:50]
            serializer = ListSerializer(lists, many=True)
            return Response(serializer.data)
        except Exception:
            # Table doesn't exist yet in Supabase
            return Response([])

    def retrieve(self, request, pk=None):
        """
        Get a single list with its restaurants.

        Maps to: ListService.getListById()
        """
        try:
            list_obj = List.objects.get(id=pk)
        except List.DoesNotExist:
            return Response(
                {'error': 'List not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get full restaurant data
        list_data = ListSerializer(list_obj).data
        if list_obj.restaurants:
            restaurants = Restaurant.objects.filter(id__in=list_obj.restaurants)
            list_data['restaurantDetails'] = RestaurantListSerializer(restaurants, many=True).data

        return Response(list_data)

    def create(self, request):
        """
        Create a new list.

        Maps to: ListService.createList()
        """
        serializer = ListCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        list_obj = List.objects.create(
            user_id=data['userId'],
            name=data['name'],
            description=data.get('description', ''),
            restaurants=data.get('restaurants', []),
            is_public=data.get('isPublic', True),
            category=data.get('category', 'restaurants'),
            list_type=data.get('listType', 'playlists'),
        )

        return Response(ListSerializer(list_obj).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        """
        Update a list.

        Maps to: ListService.updateList()
        """
        try:
            list_obj = List.objects.get(id=pk)
        except List.DoesNotExist:
            return Response(
                {'error': 'List not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ListUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        if 'name' in data:
            list_obj.name = data['name']
        if 'description' in data:
            list_obj.description = data['description']
        if 'restaurants' in data:
            list_obj.restaurants = data['restaurants']
        if 'isPublic' in data:
            list_obj.is_public = data['isPublic']

        list_obj.save()
        return Response(ListSerializer(list_obj).data)

    def destroy(self, request, pk=None):
        """
        Delete a list.

        Maps to: ListService.deleteList()
        """
        deleted, _ = List.objects.filter(id=pk).delete()
        if deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(
            {'error': 'List not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def user_lists(self, request, user_id=None):
        """
        Get lists for a user.

        Maps to: ListService.getUserLists()
        """
        lists = List.objects.filter(user_id=user_id).order_by('-created_at')
        serializer = ListSerializer(lists, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Get featured lists.

        Maps to: ListService.getFeaturedLists()
        """
        lists = List.objects.filter(is_featured=True).order_by('-created_at')[:20]
        serializer = ListSerializer(lists, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add(self, request, pk=None):
        """
        Add restaurant to list.
        """
        restaurant_id = request.data.get('restaurantId')
        if not restaurant_id:
            return Response(
                {'error': 'restaurantId is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            list_obj = List.objects.get(id=pk)
        except List.DoesNotExist:
            return Response(
                {'error': 'List not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        restaurants = list_obj.restaurants or []
        restaurant_uuid = uuid.UUID(restaurant_id)
        if restaurant_uuid not in restaurants:
            restaurants.append(restaurant_uuid)
            list_obj.restaurants = restaurants
            list_obj.save(update_fields=['restaurants', 'updated_at'])

        return Response({'success': True})

    @action(detail=True, methods=['post'])
    def remove(self, request, pk=None):
        """
        Remove restaurant from list.
        """
        restaurant_id = request.data.get('restaurantId')
        if not restaurant_id:
            return Response(
                {'error': 'restaurantId is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            list_obj = List.objects.get(id=pk)
        except List.DoesNotExist:
            return Response(
                {'error': 'List not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        restaurants = list_obj.restaurants or []
        restaurant_uuid = uuid.UUID(restaurant_id)
        if restaurant_uuid in restaurants:
            restaurants.remove(restaurant_uuid)
            list_obj.restaurants = restaurants
            list_obj.save(update_fields=['restaurants', 'updated_at'])

        return Response({'success': True})
