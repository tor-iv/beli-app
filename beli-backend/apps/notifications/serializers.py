"""
Notifications serializers.
"""
from rest_framework import serializers
from .models import Notification
from apps.users.serializers import UserListSerializer
from apps.restaurants.serializers import RestaurantListSerializer


class NotificationSerializer(serializers.ModelSerializer):
    """
    Notification serializer matching TypeScript Notification type.
    """
    type = serializers.CharField(source='notification_type')
    actorUser = UserListSerializer(source='actor_user', read_only=True)
    targetRestaurant = RestaurantListSerializer(source='target_restaurant', read_only=True)
    targetList = serializers.CharField(source='target_list', allow_null=True)
    commentText = serializers.CharField(source='comment_text', allow_null=True)
    streakCount = serializers.IntegerField(source='streak_count', allow_null=True)
    actionDescription = serializers.CharField(source='action_description')
    isRead = serializers.BooleanField(source='is_read')
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'type',
            'actorUser',
            'targetRestaurant',
            'targetList',
            'commentText',
            'streakCount',
            'actionDescription',
            'isRead',
            'timestamp',
        ]
