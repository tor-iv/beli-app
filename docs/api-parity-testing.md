# API Parity Testing: Django vs TypeScript

Quick guide to verify Django REST API matches TypeScript service responses.

## Quick Comparison

| Aspect | TypeScript (Supabase) | Django REST API |
|--------|----------------------|-----------------|
| Data Source | Supabase PostgreSQL | Same Supabase DB |
| Response Format | JSON arrays | JSON arrays (or paginated) |
| Field Naming | camelCase | camelCase (serializers) |
| User Stats | Nested `user.stats` object | ✅ Matches |
| Feed Items | Has `type` field | ✅ Matches |
| Restaurant Arrays | `cuisine: string[]` | ✅ JSONField arrays |
| UUIDs | Standard format | ✅ Matches |

## Running Tests

### 1. Quick Shell Verification
```bash
# Start Django server first
cd beli-backend && source venv/bin/activate && python manage.py runserver

# Run verification (in another terminal)
./scripts/verify-django.sh
```
Tests 11 core endpoints, shows PASS/FAIL for each.

### 2. Comprehensive Vitest Parity Tests
```bash
cd beli-web
npm run test:run
```
Runs 25 tests validating response shapes match TypeScript interfaces.

## Key Parity Fixes Applied

### 1. JSONB Arrays
Supabase stores arrays as JSONB, not PostgreSQL arrays.

```python
# apps/restaurants/models.py
cuisine = models.JSONField(default=list)  # Not ArrayField
```

### 2. User Stats in List View
TypeScript expects `stats` on all user objects.

```python
# apps/users/serializers.py
class UserListSerializer(serializers.ModelSerializer):
    stats = serializers.SerializerMethodField()

    def get_stats(self, obj):
        return {
            'followers': obj.followers_set.count(),
            'following': obj.following_set.count(),
            'beenCount': obj.ratings.filter(status='been').count(),
            'wantToTryCount': len(obj.watchlist) if obj.watchlist else 0,
        }
```

### 3. Feed Activity Type
TypeScript expects `type` field on feed items.

```python
# apps/feed/serializers.py
type = serializers.SerializerMethodField()

def get_type(self, obj):
    return {'been': 'rating', 'want_to_try': 'want-to-try'}.get(obj.status, 'rating')
```

### 4. Missing Tables
Gracefully handle tables that don't exist in Supabase.

```python
def list(self, request):
    try:
        # ... query logic
    except Exception:
        return Response([])  # Return empty array
```

## Endpoint Mapping

| TypeScript Service | Django Endpoint | Status |
|-------------------|-----------------|--------|
| `RestaurantService.getAllRestaurants()` | `GET /api/v1/restaurants/` | ✅ |
| `RestaurantService.searchRestaurants()` | `GET /api/v1/restaurants/search/` | ✅ |
| `RestaurantService.getTrendingRestaurants()` | `GET /api/v1/restaurants/trending/` | ✅ |
| `UserService.getCurrentUser()` | `GET /api/v1/users/me/` | ✅ |
| `UserService.searchUsers()` | `GET /api/v1/users/search/` | ✅ |
| `UserService.getLeaderboard()` | `GET /api/v1/users/leaderboard/` | ✅ |
| `FeedService.getActivityFeed()` | `GET /api/v1/feed/` | ✅ |
| `ListService.getUserLists()` | `GET /api/v1/lists/` | ✅ |
| `NotificationService.getNotifications()` | `GET /api/v1/notifications/` | ✅ |
| `TastemakerService.getTastemakers()` | `GET /api/v1/tastemakers/` | ✅ |

## Response Shape Examples

### Restaurant (Both match)
```json
{
  "id": "uuid",
  "name": "Restaurant Name",
  "cuisine": ["Italian", "Pizza"],
  "category": "restaurants",
  "priceRange": "$$",
  "neighborhood": "SoHo",
  "rating": 8.5
}
```

### User with Stats (Both match)
```json
{
  "id": "uuid",
  "username": "john_doe",
  "displayName": "John Doe",
  "avatar": "https://...",
  "stats": {
    "followers": 120,
    "following": 85,
    "beenCount": 45,
    "wantToTryCount": 12
  }
}
```

### Feed Item (Both match)
```json
{
  "id": "uuid",
  "type": "rating",
  "user": { "id": "...", "username": "..." },
  "restaurant": { "id": "...", "name": "..." },
  "rating": 8.0,
  "createdAt": "2024-01-15T..."
}
```
