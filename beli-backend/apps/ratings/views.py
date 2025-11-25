"""
Ratings API views.

Provides CRUD endpoints for user-restaurant relationships,
matching UserRestaurantService methods.
"""
import uuid
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count, Q
from django.utils import timezone
from datetime import timedelta

from apps.users.models import Rating, User, UserFollow
from apps.restaurants.models import Restaurant
from apps.restaurants.serializers import RestaurantListSerializer
from .serializers import (
    RatingCreateSerializer,
    RatingDetailSerializer,
    RatingListSerializer,
)


class RatingsViewSet(viewsets.ViewSet):
    """
    API endpoint for ratings (user-restaurant relationships).

    Supports:
    - GET /api/v1/ratings/user/{userId}/ - Get user's ratings
    - GET /api/v1/ratings/user/{userId}/status/{status}/ - Get by status
    - POST /api/v1/ratings/ - Add rating
    - PATCH /api/v1/ratings/{userId}/{restaurantId}/ - Update rating
    - DELETE /api/v1/ratings/{userId}/{restaurantId}/ - Remove rating
    - GET /api/v1/ratings/watchlist/{userId}/ - Get watchlist
    - POST /api/v1/ratings/watchlist/{userId}/ - Add to watchlist
    - DELETE /api/v1/ratings/watchlist/{userId}/{restaurantId}/ - Remove from watchlist
    - GET /api/v1/ratings/friend-recs/{userId}/ - Get friend recommendations
    """

    def create(self, request):
        """
        Add a restaurant to user's list.

        Maps to: UserRestaurantService.addRestaurantToUserList()
        """
        serializer = RatingCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        # Create or update rating
        rating, created = Rating.objects.update_or_create(
            user_id=data['userId'],
            restaurant_id=data['restaurantId'],
            defaults={
                'status': data['status'],
                'rating': data.get('rating'),
                'notes': data.get('notes', ''),
                'photos': data.get('photos', []),
                'tags': data.get('tags', []),
                'visit_date': data.get('visitDate'),
                'companions': data.get('companions', []),
            }
        )

        return Response(
            RatingDetailSerializer(rating).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)')
    def user_ratings(self, request, user_id=None):
        """
        Get all ratings for a user.

        Maps to: UserRestaurantService.getUserRestaurantRelations()
        """
        ratings = Rating.objects.filter(
            user_id=user_id
        ).select_related('restaurant').order_by('-created_at')

        serializer = RatingDetailSerializer(ratings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>[^/.]+)/status/(?P<rating_status>[^/.]+)')
    def user_ratings_by_status(self, request, user_id=None, rating_status=None):
        """
        Get user's ratings filtered by status.

        Maps to: UserRestaurantService.getUserRestaurantsByStatus()
        """
        ratings = Rating.objects.filter(
            user_id=user_id,
            status=rating_status
        ).select_related('restaurant').order_by('-created_at')

        # Return just the restaurants
        restaurants = [r.restaurant for r in ratings]
        serializer = RestaurantListSerializer(restaurants, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get', 'delete'], url_path='(?P<user_id>[^/.]+)/(?P<restaurant_id>[^/.]+)')
    def rating_detail(self, request, user_id=None, restaurant_id=None):
        """
        Get or delete a specific rating.

        Maps to: UserRestaurantService.getUserRestaurantRelation()
        Maps to: UserRestaurantService.removeRestaurantFromUserList()
        """
        if request.method == 'GET':
            try:
                rating = Rating.objects.select_related('restaurant').get(
                    user_id=user_id,
                    restaurant_id=restaurant_id
                )
                return Response(RatingDetailSerializer(rating).data)
            except Rating.DoesNotExist:
                return Response(
                    {'error': 'Rating not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

        elif request.method == 'DELETE':
            deleted, _ = Rating.objects.filter(
                user_id=user_id,
                restaurant_id=restaurant_id
            ).delete()

            if deleted:
                return Response(status=status.HTTP_204_NO_CONTENT)
            return Response(
                {'error': 'Rating not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get', 'post'], url_path='watchlist/(?P<user_id>[^/.]+)')
    def watchlist(self, request, user_id=None):
        """
        Get or add to user's watchlist (want-to-try).

        Maps to: UserRestaurantService.getWatchlist()
        Maps to: UserRestaurantService.addToWatchlist()
        """
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.method == 'GET':
            # Return restaurants in watchlist
            if not user.watchlist:
                return Response([])

            restaurants = Restaurant.objects.filter(id__in=user.watchlist)
            serializer = RestaurantListSerializer(restaurants, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            restaurant_id = request.data.get('restaurantId')
            if not restaurant_id:
                return Response(
                    {'error': 'restaurantId is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Add to watchlist if not already there
            watchlist = user.watchlist or []
            restaurant_uuid = uuid.UUID(restaurant_id)
            if restaurant_uuid not in watchlist:
                watchlist.append(restaurant_uuid)
                user.watchlist = watchlist
                user.save(update_fields=['watchlist'])

            return Response({'success': True, 'inWatchlist': True})

    @action(detail=False, methods=['delete'], url_path='watchlist/(?P<user_id>[^/.]+)/(?P<restaurant_id>[^/.]+)')
    def watchlist_remove(self, request, user_id=None, restaurant_id=None):
        """
        Remove from user's watchlist.

        Maps to: UserRestaurantService.removeFromWatchlist()
        """
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        watchlist = user.watchlist or []
        restaurant_uuid = uuid.UUID(restaurant_id)
        if restaurant_uuid in watchlist:
            watchlist.remove(restaurant_uuid)
            user.watchlist = watchlist
            user.save(update_fields=['watchlist'])

        return Response({'success': True, 'inWatchlist': False})

    @action(detail=False, methods=['get'], url_path='friend-recs/(?P<user_id>[^/.]+)')
    def friend_recommendations(self, request, user_id=None):
        """
        Get friend recommendations - restaurants friends rated highly
        that the user hasn't visited.

        Maps to: UserRestaurantService.getFriendRecommendations()
        """
        min_rating = float(request.query_params.get('minRating', 8.0))
        limit = int(request.query_params.get('limit', 20))

        # Get users this person follows
        following_ids = list(
            UserFollow.objects.filter(follower_id=user_id)
            .values_list('following_id', flat=True)
        )

        if not following_ids:
            return Response([])

        # Get restaurants the user has already been to
        user_visited = set(
            Rating.objects.filter(user_id=user_id, status='been')
            .values_list('restaurant_id', flat=True)
        )

        # Get high-rated restaurants from friends
        friend_ratings = Rating.objects.filter(
            user_id__in=following_ids,
            status='been',
            rating__gte=min_rating
        ).exclude(
            restaurant_id__in=user_visited
        ).select_related('user', 'restaurant').order_by('-rating')[:limit * 2]

        # Aggregate by restaurant
        recommendations = {}
        for rating in friend_ratings:
            rid = str(rating.restaurant_id)
            if rid not in recommendations:
                recommendations[rid] = {
                    'restaurant': rating.restaurant,
                    'friendRating': float(rating.rating),
                    'recommenderName': rating.user.display_name,
                    'recommenderUsername': rating.user.username,
                    'recommenderCount': 1,
                }
            else:
                recommendations[rid]['recommenderCount'] += 1
                # Use highest rating
                if float(rating.rating) > recommendations[rid]['friendRating']:
                    recommendations[rid]['friendRating'] = float(rating.rating)
                    recommendations[rid]['recommenderName'] = rating.user.display_name
                    recommendations[rid]['recommenderUsername'] = rating.user.username

        # Sort by rating and limit
        sorted_recs = sorted(
            recommendations.values(),
            key=lambda x: (-x['friendRating'], -x['recommenderCount'])
        )[:limit]

        # Format response
        result = []
        for rec in sorted_recs:
            result.append({
                'restaurant': RestaurantListSerializer(rec['restaurant']).data,
                'friendRating': rec['friendRating'],
                'recommenderName': rec['recommenderName'],
                'recommenderUsername': rec['recommenderUsername'],
                'recommenderCount': rec['recommenderCount'],
            })

        return Response(result)

    @action(detail=False, methods=['get'], url_path='reviews/restaurant/(?P<restaurant_id>[^/.]+)')
    def restaurant_reviews(self, request, restaurant_id=None):
        """
        Get reviews for a restaurant.

        Maps to: UserRestaurantService.getRestaurantReviews()
        """
        reviews = Rating.objects.filter(
            restaurant_id=restaurant_id,
            status='been',
            notes__isnull=False
        ).exclude(notes='').select_related('user').order_by('-created_at')

        result = []
        for review in reviews:
            result.append({
                'id': str(review.id),
                'userId': str(review.user_id),
                'user': {
                    'id': str(review.user.id),
                    'username': review.user.username,
                    'displayName': review.user.display_name,
                    'avatar': review.user.avatar,
                },
                'restaurantId': str(review.restaurant_id),
                'rating': float(review.rating) if review.rating else None,
                'content': review.notes,
                'photos': review.photos or [],
                'tags': review.tags or [],
                'visitDate': review.visit_date.isoformat() if review.visit_date else None,
                'createdAt': review.created_at.isoformat(),
            })

        return Response(result)
