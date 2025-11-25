"""
Group Dinner serializers.
"""
from rest_framework import serializers
from .models import Reservation
from apps.restaurants.serializers import RestaurantListSerializer
from apps.users.serializers import UserListSerializer


class GroupDinnerMatchSerializer(serializers.Serializer):
    """
    Serializer for group dinner match results.
    """
    restaurant = RestaurantListSerializer()
    score = serializers.IntegerField()
    onListsCount = serializers.IntegerField()
    participants = serializers.ListField(child=serializers.CharField())
    matchReasons = serializers.ListField(child=serializers.CharField())
    availability = serializers.DictField(allow_null=True)


class GroupDinnerRequestSerializer(serializers.Serializer):
    """
    Serializer for group dinner suggestion request.
    """
    userId = serializers.UUIDField()
    participantIds = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        default=list
    )
    category = serializers.CharField(required=False, allow_null=True)


class ReservationSerializer(serializers.ModelSerializer):
    """
    Serializer for reservations.
    """
    restaurantId = serializers.UUIDField(source='restaurant_id')
    userId = serializers.UUIDField(source='user_id')
    restaurant = RestaurantListSerializer(read_only=True)
    user = UserListSerializer(read_only=True)
    dateTime = serializers.DateTimeField(source='date_time')
    partySize = serializers.IntegerField(source='party_size')
    claimedBy = serializers.UUIDField(source='claimed_by_id', allow_null=True)
    sharedWith = serializers.ListField(source='shared_with', child=serializers.UUIDField())
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id',
            'restaurantId',
            'restaurant',
            'userId',
            'user',
            'dateTime',
            'partySize',
            'status',
            'claimedBy',
            'sharedWith',
            'notes',
            'createdAt',
        ]
