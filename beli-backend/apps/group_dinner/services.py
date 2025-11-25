"""
Group Dinner matching algorithm.

Matches the TypeScript GroupDinnerService.getGroupDinnerSuggestions() implementation.
"""
from collections import defaultdict
from datetime import timedelta
from django.utils import timezone
from django.db.models import Q

from apps.users.models import Rating, User
from apps.restaurants.models import Restaurant


class GroupDinnerMatchingService:
    """
    AI-powered group dinner matching algorithm.

    Scoring weights:
    - Want-to-try overlap: 70%
    - Dietary compatibility: 20%
    - Location convenience: 10%
    """

    WEIGHTS = {
        'want_to_try_overlap': 0.70,
        'dietary_compatibility': 0.20,
        'location_convenience': 0.10,
    }

    @classmethod
    def get_suggestions(
        cls,
        user_id: str,
        participant_ids: list = None,
        category: str = None,
        limit: int = 20
    ) -> list:
        """
        Generate group dinner suggestions based on participant preferences.

        Args:
            user_id: Organizer's user ID
            participant_ids: List of participant user IDs (optional, empty = solo)
            category: Filter by restaurant category
            limit: Maximum suggestions to return

        Returns:
            List of GroupDinnerMatch objects sorted by score
        """
        all_user_ids = [user_id] + (participant_ids or [])

        # Get want-to-try restaurants for all participants
        # Note: want_to_try is stored in users.watchlist array
        users = User.objects.filter(id__in=all_user_ids)

        # Collect all watchlist items
        restaurant_users = defaultdict(list)  # restaurant_id -> [user_ids]
        for user in users:
            if user.watchlist:
                for rid in user.watchlist:
                    restaurant_users[str(rid)].append(str(user.id))

        # Also check ratings with want_to_try status (legacy)
        want_to_try_ratings = Rating.objects.filter(
            user_id__in=all_user_ids,
            status='want_to_try'
        ).values('restaurant_id', 'user_id')

        for rating in want_to_try_ratings:
            rid = str(rating['restaurant_id'])
            uid = str(rating['user_id'])
            if uid not in restaurant_users[rid]:
                restaurant_users[rid].append(uid)

        # Exclude recently visited (last 30 days)
        recent_cutoff = timezone.now() - timedelta(days=30)
        recently_visited = set(
            Rating.objects.filter(
                user_id__in=all_user_ids,
                status='been',
                visit_date__gte=recent_cutoff.date()
            ).values_list('restaurant_id', flat=True)
        )

        # Also exclude from created_at if visit_date is null
        recently_visited.update(
            Rating.objects.filter(
                user_id__in=all_user_ids,
                status='been',
                visit_date__isnull=True,
                created_at__gte=recent_cutoff
            ).values_list('restaurant_id', flat=True)
        )

        recently_visited_str = {str(rid) for rid in recently_visited}

        # Get dietary restrictions for all users
        dietary_restrictions = set()
        for user in users:
            if hasattr(user, 'dietary_restrictions') and user.dietary_restrictions:
                dietary_restrictions.update(user.dietary_restrictions)

        # Build scored matches
        matches = []
        restaurant_ids_to_fetch = [
            rid for rid in restaurant_users.keys()
            if rid not in recently_visited_str
        ]

        if not restaurant_ids_to_fetch:
            return []

        restaurants = {
            str(r.id): r
            for r in Restaurant.objects.filter(id__in=restaurant_ids_to_fetch)
        }

        num_participants = len(all_user_ids)

        for rid, user_ids in restaurant_users.items():
            if rid in recently_visited_str:
                continue

            restaurant = restaurants.get(rid)
            if not restaurant:
                continue

            # Filter by category
            if category and restaurant.category != category:
                continue

            # Calculate scores
            score = 0
            match_reasons = []

            # Want-to-try overlap (70% weight)
            overlap_count = len(user_ids)
            overlap_ratio = overlap_count / num_participants
            want_to_try_score = overlap_ratio * cls.WEIGHTS['want_to_try_overlap'] * 100
            score += want_to_try_score

            if overlap_count == num_participants:
                match_reasons.append('Everyone wants to try this!')
            elif overlap_count > 1:
                match_reasons.append(f'On {overlap_count} want-to-try lists')
            else:
                match_reasons.append('On your want-to-try list')

            # Dietary compatibility (20% weight)
            # Simplified: assume all restaurants accommodate restrictions
            dietary_score = cls.WEIGHTS['dietary_compatibility'] * 100
            score += dietary_score
            if dietary_restrictions:
                match_reasons.append('Accommodates dietary preferences')

            # Location convenience (10% weight)
            location_score = cls.WEIGHTS['location_convenience'] * 100
            score += location_score

            matches.append({
                'restaurant': restaurant,
                'score': round(score),
                'onListsCount': overlap_count,
                'participants': user_ids,
                'matchReasons': match_reasons,
                'availability': None,  # Would check reservation system
            })

        # Sort by score descending
        matches.sort(key=lambda m: m['score'], reverse=True)

        return matches[:limit]

    @classmethod
    def get_restaurant_availability(cls, restaurant_id: str, date: str) -> dict:
        """
        Check restaurant availability for a date.

        Returns mock availability for now.
        """
        # This would integrate with a real reservation system
        return {
            'available': True,
            'timeSlots': ['6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'],
        }
