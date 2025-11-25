"""
Group Dinner API views.

Provides REST endpoints for group dinner matching and reservations.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .services import GroupDinnerMatchingService
from .serializers import (
    GroupDinnerMatchSerializer,
    GroupDinnerRequestSerializer,
    ReservationSerializer,
)
from .models import Reservation
from apps.users.models import User, UserFollow
from apps.users.serializers import UserListSerializer
from apps.restaurants.serializers import RestaurantListSerializer


class GroupDinnerViewSet(viewsets.ViewSet):
    """
    API endpoint for group dinner features.

    Supports:
    - POST /api/v1/group-dinner/suggestions/ - Get restaurant suggestions
    - GET /api/v1/group-dinner/friends/{userId}/ - Get user's friends
    - GET /api/v1/group-dinner/companions/{userId}/ - Get recent dining companions
    - GET /api/v1/group-dinner/availability/{restaurantId}/ - Check availability
    - GET /api/v1/group-dinner/reservations/{userId}/ - Get user's reservations
    - POST /api/v1/group-dinner/reservations/{id}/claim/ - Claim a reservation
    - POST /api/v1/group-dinner/reservations/{id}/share/ - Share a reservation
    """

    @action(detail=False, methods=['post'])
    def suggestions(self, request):
        """
        Get group dinner restaurant suggestions.

        Maps to: GroupDinnerService.getGroupDinnerSuggestions()
        """
        serializer = GroupDinnerRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        matches = GroupDinnerMatchingService.get_suggestions(
            user_id=str(data['userId']),
            participant_ids=[str(p) for p in data.get('participantIds', [])],
            category=data.get('category'),
        )

        # Serialize results
        result = []
        for match in matches:
            result.append({
                'restaurant': RestaurantListSerializer(match['restaurant']).data,
                'score': match['score'],
                'onListsCount': match['onListsCount'],
                'participants': match['participants'],
                'matchReasons': match['matchReasons'],
                'availability': match['availability'],
            })

        return Response(result)

    @action(detail=False, methods=['get'], url_path='friends/(?P<user_id>[^/.]+)')
    def friends(self, request, user_id=None):
        """
        Get user's friends (people they follow).

        Maps to: GroupDinnerService.getUserFriends()
        """
        following_ids = list(
            UserFollow.objects.filter(follower_id=user_id)
            .values_list('following_id', flat=True)
        )

        friends = User.objects.filter(id__in=following_ids)
        serializer = UserListSerializer(friends, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='companions/(?P<user_id>[^/.]+)')
    def companions(self, request, user_id=None):
        """
        Get user's recent dining companions.

        Maps to: GroupDinnerService.getRecentDiningCompanions()
        """
        from apps.users.models import Rating

        # Get companion IDs from recent ratings
        recent_ratings = Rating.objects.filter(
            user_id=user_id,
            status='been',
            companions__len__gt=0
        ).order_by('-created_at')[:20]

        companion_ids = set()
        for rating in recent_ratings:
            if rating.companions:
                for cid in rating.companions:
                    if str(cid) != str(user_id):
                        companion_ids.add(cid)

        if not companion_ids:
            return Response([])

        companions = User.objects.filter(id__in=list(companion_ids)[:10])
        serializer = UserListSerializer(companions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='availability/(?P<restaurant_id>[^/.]+)')
    def availability(self, request, restaurant_id=None):
        """
        Check restaurant availability.

        Maps to: GroupDinnerService.getRestaurantAvailability()
        """
        date = request.query_params.get('date')

        availability = GroupDinnerMatchingService.get_restaurant_availability(
            restaurant_id, date
        )

        return Response(availability)

    @action(detail=False, methods=['get'], url_path='reservations/(?P<user_id>[^/.]+)')
    def user_reservations(self, request, user_id=None):
        """
        Get user's reservations.

        Maps to: GroupDinnerService.getUserReservations()
        """
        filter_type = request.query_params.get('filter', 'all')

        reservations = Reservation.objects.filter(
            user_id=user_id
        ).select_related('restaurant', 'user').order_by('date_time')

        if filter_type == 'upcoming':
            from django.utils import timezone
            reservations = reservations.filter(date_time__gte=timezone.now())
        elif filter_type == 'past':
            from django.utils import timezone
            reservations = reservations.filter(date_time__lt=timezone.now())

        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        """
        Claim a reservation.

        Maps to: GroupDinnerService.claimReservation()
        """
        user_id = request.data.get('userId')
        if not user_id:
            return Response(
                {'error': 'userId is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            reservation = Reservation.objects.get(id=pk)
        except Reservation.DoesNotExist:
            return Response(
                {'error': 'Reservation not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if reservation.status != 'available':
            return Response(
                {'error': 'Reservation is not available'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reservation.claimed_by_id = user_id
        reservation.status = 'claimed'
        reservation.save()

        serializer = ReservationSerializer(reservation)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """
        Share a reservation with others.

        Maps to: GroupDinnerService.shareReservation()
        """
        participant_ids = request.data.get('participantIds', [])

        try:
            reservation = Reservation.objects.get(id=pk)
        except Reservation.DoesNotExist:
            return Response(
                {'error': 'Reservation not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        reservation.shared_with = participant_ids
        reservation.status = 'shared'
        reservation.save()

        serializer = ReservationSerializer(reservation)
        return Response(serializer.data)
