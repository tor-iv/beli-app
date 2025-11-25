"""
User business logic services.

Contains complex algorithms like match percentage calculation.
"""
from django.core.cache import cache
from .models import Rating
from apps.restaurants.models import Restaurant


class MatchService:
    """
    Calculate taste compatibility between users.

    Uses Jaccard similarity algorithm:
    - 70% weight: Restaurant overlap
    - 30% weight: Cuisine preference overlap

    Results are cached for 5 minutes.
    """
    CACHE_TTL = 300  # 5 minutes

    @classmethod
    def calculate_match(cls, user_id: str, target_id: str) -> int:
        """
        Calculate match percentage between two users.

        Args:
            user_id: First user's UUID
            target_id: Second user's UUID

        Returns:
            Match percentage (30-99)
        """
        # Symmetric cache key (same result regardless of order)
        cache_key = f"match:{'-'.join(sorted([str(user_id), str(target_id)]))}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

        # Get restaurant sets for both users
        user_restaurants = set(
            Rating.objects.filter(
                user_id=user_id,
                status__in=['been', 'want_to_try']
            ).values_list('restaurant_id', flat=True)
        )

        target_restaurants = set(
            Rating.objects.filter(
                user_id=target_id,
                status__in=['been', 'want_to_try']
            ).values_list('restaurant_id', flat=True)
        )

        # If either user has no restaurants, return baseline
        if not user_restaurants or not target_restaurants:
            return 30

        # Calculate Jaccard similarity for restaurants
        intersection = user_restaurants & target_restaurants
        union = user_restaurants | target_restaurants
        restaurant_similarity = len(intersection) / len(union) if union else 0

        # Get cuisine preferences from restaurants
        all_restaurant_ids = list(union)
        restaurants = Restaurant.objects.filter(id__in=all_restaurant_ids)

        user_cuisines = set()
        target_cuisines = set()

        for restaurant in restaurants:
            if restaurant.id in user_restaurants:
                user_cuisines.update(restaurant.cuisine)
            if restaurant.id in target_restaurants:
                target_cuisines.update(restaurant.cuisine)

        # Calculate Jaccard similarity for cuisines
        cuisine_intersection = user_cuisines & target_cuisines
        cuisine_union = user_cuisines | target_cuisines
        cuisine_similarity = (
            len(cuisine_intersection) / len(cuisine_union)
            if cuisine_union else 0
        )

        # Combined score: 70% restaurant + 30% cuisine
        match_score = (restaurant_similarity * 0.7 + cuisine_similarity * 0.3) * 100

        # Add small variance and clamp to 30-99
        import random
        variance = random.randint(-3, 3)
        result = max(30, min(99, int(match_score + variance)))

        # Cache result
        cache.set(cache_key, result, cls.CACHE_TTL)

        return result

    @classmethod
    def calculate_batch(cls, user_id: str, target_ids: list) -> dict:
        """
        Calculate match percentages for multiple users.

        Args:
            user_id: Base user's UUID
            target_ids: List of target user UUIDs

        Returns:
            Dict mapping target_id -> match percentage
        """
        return {
            str(target_id): cls.calculate_match(user_id, target_id)
            for target_id in target_ids
        }


class TasteProfileService:
    """
    Analyze user's dining patterns and preferences.

    Generates insights based on:
    - Restaurant ratings history
    - Cuisine preferences
    - Price range tendencies
    - Rating patterns
    """
    CACHE_TTL = 600  # 10 minutes

    @classmethod
    def get_taste_profile(cls, user_id: str) -> dict:
        """
        Generate comprehensive taste profile for a user.

        Args:
            user_id: User's UUID

        Returns:
            Dict with cuisine preferences, price tendencies, and insights
        """
        from collections import Counter
        from django.db.models import Avg, Count
        from django.core.cache import cache

        cache_key = f"taste_profile:{user_id}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

        # Get user's ratings with restaurant data
        ratings = Rating.objects.filter(
            user_id=user_id,
            status='been'
        ).select_related('restaurant')

        if not ratings.exists():
            return {
                'topCuisines': [],
                'pricePreference': None,
                'averageRating': None,
                'ratingDistribution': {},
                'totalRated': 0,
                'adventurousnessScore': 0,
                'insights': ['Not enough data yet. Rate more restaurants to see your taste profile!']
            }

        # Analyze cuisines
        cuisine_counter = Counter()
        price_counter = Counter()
        rating_scores = []

        for rating in ratings:
            restaurant = rating.restaurant
            if restaurant:
                # Count cuisines
                if restaurant.cuisine:
                    for cuisine in restaurant.cuisine:
                        cuisine_counter[cuisine] += 1
                # Count price ranges
                if restaurant.price_level:
                    price_counter[restaurant.price_level] += 1
            # Track rating scores
            if rating.score is not None:
                rating_scores.append(rating.score)

        # Top cuisines (up to 5)
        top_cuisines = [
            {'cuisine': cuisine, 'count': count}
            for cuisine, count in cuisine_counter.most_common(5)
        ]

        # Price preference (most common)
        price_preference = price_counter.most_common(1)[0][0] if price_counter else None

        # Average rating
        avg_rating = sum(rating_scores) / len(rating_scores) if rating_scores else None

        # Rating distribution
        rating_distribution = {}
        for score in rating_scores:
            bucket = str(int(score)) if score else 'unrated'
            rating_distribution[bucket] = rating_distribution.get(bucket, 0) + 1

        # Adventurousness score (based on cuisine variety)
        unique_cuisines = len(cuisine_counter)
        total_rated = ratings.count()
        adventurousness = min(100, int((unique_cuisines / max(total_rated, 1)) * 100 * 3))

        # Generate insights
        insights = cls._generate_insights(
            top_cuisines, price_preference, avg_rating,
            adventurousness, total_rated
        )

        result = {
            'topCuisines': top_cuisines,
            'pricePreference': price_preference,
            'averageRating': round(avg_rating, 1) if avg_rating else None,
            'ratingDistribution': rating_distribution,
            'totalRated': total_rated,
            'adventurousnessScore': adventurousness,
            'insights': insights
        }

        cache.set(cache_key, result, cls.CACHE_TTL)
        return result

    @classmethod
    def _generate_insights(
        cls, top_cuisines: list, price_pref: str,
        avg_rating: float, adventurousness: int, total: int
    ) -> list:
        """Generate human-readable insights."""
        insights = []

        if top_cuisines:
            fav = top_cuisines[0]['cuisine']
            insights.append(f"Your top cuisine is {fav}")

        if price_pref:
            price_labels = {1: 'budget-friendly', 2: 'moderate', 3: 'upscale', 4: 'fine dining'}
            label = price_labels.get(price_pref, 'varied')
            insights.append(f"You tend to prefer {label} restaurants")

        if avg_rating:
            if avg_rating >= 8:
                insights.append("You're a selective diner - you know what you like!")
            elif avg_rating >= 6:
                insights.append("You have a balanced palate with varied tastes")
            else:
                insights.append("You're an honest critic who isn't afraid to give low scores")

        if adventurousness >= 70:
            insights.append("You're a culinary adventurer who loves trying new cuisines!")
        elif adventurousness >= 40:
            insights.append("You balance favorites with new discoveries")

        if total >= 50:
            insights.append(f"With {total} restaurants rated, you're a seasoned foodie!")

        return insights
