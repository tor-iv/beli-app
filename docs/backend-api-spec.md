# Beli Backend API Specification

## Overview

This document provides the complete API specification for the Beli backend, including all endpoints, request/response schemas, authentication requirements, and error handling patterns.

**Base URL**: `https://api.beli.app/api/v1`
**Protocol**: HTTPS only
**Format**: JSON
**Authentication**: JWT Bearer tokens

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Restaurants](#restaurants)
4. [Lists](#lists)
5. [Reviews](#reviews)
6. [Social / Feed](#social--feed)
7. [Leaderboard](#leaderboard)
8. [Tastemakers](#tastemakers)
9. [Group Dinner](#group-dinner)
10. [What to Order](#what-to-order)
11. [Notifications](#notifications)
12. [Search](#search)
13. [Featured Lists](#featured-lists)
14. [Reservations](#reservations)
15. [Taste Profile](#taste-profile)

---

## Global Headers

### Request Headers

```
Authorization: Bearer <jwt_token>    (required for authenticated routes)
Content-Type: application/json       (for POST/PATCH/PUT requests)
X-Request-ID: <uuid>                 (optional, for request tracing)
X-Client-Version: <version>          (e.g., "mobile-ios-1.0.0" or "web-1.2.3")
```

### Response Headers

```
Content-Type: application/json
X-Request-ID: <uuid>
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1640000000
Cache-Control: max-age=300 (for cacheable responses)
```

---

## Standard Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 250,
    "hasMore": true
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... },
    "statusCode": 400
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `CONFLICT` | 409 | Resource conflict (e.g., already exists) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 1. Authentication

### 1.1 Sign Up

**Endpoint**: `POST /auth/signup`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "john_doe",
  "displayName": "John Doe"
}
```

**Response**: 201 Created
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "username": "john_doe",
      "displayName": "John Doe",
      "avatar": null,
      "createdAt": "2025-01-29T12:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

**Validation**:
- Email: Valid email format, unique
- Password: Min 8 chars, 1 uppercase, 1 number
- Username: 3-20 chars, alphanumeric + underscore, unique

### 1.2 Login

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**: 200 OK (same as signup)

### 1.3 OAuth Login

**Endpoint**: `POST /auth/oauth/{provider}`

**Providers**: `google`, `apple`

**Request Body**:
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs...",
  "provider": "google"
}
```

**Response**: 200 OK (same as signup)

### 1.4 Refresh Token

**Endpoint**: `POST /auth/refresh`

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "expiresIn": 900
  }
}
```

### 1.5 Logout

**Endpoint**: `POST /auth/logout`

**Headers**: Authorization required

**Response**: 204 No Content

---

## 2. Users

### 2.1 Get Current User

**Endpoint**: `GET /users/me`

**Headers**: Authorization required

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "id": 123,
    "username": "john_doe",
    "displayName": "John Doe",
    "email": "user@example.com",
    "avatar": "https://cdn.beli.app/users/123.jpg",
    "bio": "Food lover from NYC",
    "location": {
      "city": "New York",
      "state": "NY"
    },
    "dietaryRestrictions": ["vegetarian"],
    "dislikedCuisines": ["indian"],
    "stats": {
      "beenCount": 142,
      "wantToTryCount": 89,
      "followersCount": 53,
      "followingCount": 67,
      "currentStreak": 12,
      "rank": 8,
      "totalReviews": 98
    },
    "challenge2025": {
      "year": 2025,
      "goalCount": 100,
      "currentCount": 15
    },
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 2.2 Get User By ID

**Endpoint**: `GET /users/:id`

**Response**: 200 OK (same structure as /users/me, but email hidden)

### 2.3 Get User By Username

**Endpoint**: `GET /users/username/:username`

**Response**: 200 OK

### 2.4 Update Current User

**Endpoint**: `PATCH /users/me`

**Headers**: Authorization required

**Request Body** (all fields optional):
```json
{
  "displayName": "John Smith",
  "bio": "Updated bio",
  "location": {
    "city": "Brooklyn",
    "state": "NY"
  },
  "dietaryRestrictions": ["vegetarian", "gluten-free"],
  "dislikedCuisines": ["indian"]
}
```

**Response**: 200 OK (full user object)

### 2.5 Update Avatar

**Endpoint**: `POST /users/me/avatar`

**Headers**: Authorization required, Content-Type: multipart/form-data

**Request Body**:
```
file: <image file> (JPEG/PNG, max 5MB)
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "avatar": "https://cdn.beli.app/users/123.jpg"
  }
}
```

### 2.6 Search Users

**Endpoint**: `GET /users/search`

**Query Parameters**:
- `q` (string, required): Search query
- `limit` (number, default: 20): Results per page
- `cursor` (string, optional): Pagination cursor

**Example**: `GET /users/search?q=john&limit=10`

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "username": "john_doe",
      "displayName": "John Doe",
      "avatar": "https://...",
      "followersCount": 53,
      "beenCount": 142,
      "isFollowing": false
    }
  ],
  "meta": {
    "nextCursor": "eyJpZCI6MTMwfQ",
    "hasMore": true
  }
}
```

### 2.7 Get User Stats

**Endpoint**: `GET /users/:id/stats`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "beenCount": 142,
    "wantToTryCount": 89,
    "recommendationsCount": 34,
    "followersCount": 53,
    "followingCount": 67,
    "currentStreak": 12,
    "longestStreak": 28,
    "rank": 8,
    "totalReviews": 98,
    "averageRating": 7.8,
    "topCuisines": [
      { "cuisine": "italian", "count": 32 },
      { "cuisine": "japanese", "count": 28 }
    ]
  }
}
```

---

## 3. Restaurants

### 3.1 List Restaurants

**Endpoint**: `GET /restaurants`

**Query Parameters**:
- `page` (number, default: 1): Page number
- `pageSize` (number, default: 20): Items per page
- `cuisines` (string[], optional): Filter by cuisines (comma-separated)
- `priceRange` (string[], optional): Filter by price ($, $$, $$$, $$$$)
- `neighborhood` (string, optional): Filter by neighborhood
- `maxDistance` (number, optional): Max distance in miles from user
- `minRating` (number, optional): Minimum rating (0-10)
- `sort` (string, optional): `rating`, `distance`, `name`

**Example**: `GET /restaurants?cuisines=italian,japanese&priceRange=$$,$$$&sort=rating`

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Carbone",
      "cuisines": ["italian"],
      "rating": 9.2,
      "priceRange": "$$$$",
      "images": ["https://..."],
      "location": {
        "neighborhood": "Greenwich Village",
        "city": "New York",
        "state": "NY",
        "coordinates": {
          "latitude": 40.7308,
          "longitude": -74.0023
        }
      },
      "isOpen": true,
      "closingTime": "23:00",
      "distanceFromUser": 0.8,
      "userStatus": "been",
      "userRating": 9.0,
      "friendsWantToTryCount": 5
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 250,
    "totalPages": 13
  }
}
```

### 3.2 Get Restaurant Details

**Endpoint**: `GET /restaurants/:id`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Carbone",
    "cuisines": ["italian"],
    "rating": 9.2,
    "recScore": 9.5,
    "friendScore": 8.8,
    "averageScore": 9.0,
    "priceRange": "$$$$",
    "images": [
      "https://cdn.beli.app/restaurants/1/main.jpg",
      "https://cdn.beli.app/restaurants/1/interior.jpg"
    ],
    "phone": "+1-212-555-1234",
    "website": "https://carbonenewyork.com",
    "location": {
      "address": "181 Thompson St",
      "neighborhood": "Greenwich Village",
      "city": "New York",
      "state": "NY",
      "zipCode": "10012",
      "coordinates": {
        "latitude": 40.7308,
        "longitude": -74.0023
      }
    },
    "hours": {
      "monday": { "open": "17:00", "close": "23:00" },
      "tuesday": { "open": "17:00", "close": "23:00" },
      "wednesday": { "open": "17:00", "close": "23:00" },
      "thursday": { "open": "17:00", "close": "23:00" },
      "friday": { "open": "17:00", "close": "00:00" },
      "saturday": { "open": "17:00", "close": "00:00" },
      "sunday": { "open": "17:00", "close": "22:00" }
    },
    "isOpen": true,
    "closingTime": "23:00",
    "acceptsReservations": true,
    "tags": ["romantic", "special_occasion", "famous"],
    "popularDishes": ["Spicy Rigatoni", "Veal Parmesan", "Carbone Salad"],
    "category": "restaurants",
    "ratingCount": 1247,
    "distanceFromUser": 0.8,
    "userStatus": "been",
    "userRating": 9.0,
    "userVisitDate": "2025-01-15",
    "userNotes": "Amazing pasta! Go early.",
    "friendsWantToTryCount": 5,
    "friendAvatars": ["https://...", "https://..."],
    "recommendedBy": [123, 456]
  }
}
```

### 3.3 Get Restaurant Menu

**Endpoint**: `GET /restaurants/:id/menu`

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Spicy Rigatoni",
      "category": "entree",
      "description": "Vodka sauce with calabrian chili",
      "price": 38,
      "portion": "shareable",
      "popularity": "high",
      "isVegetarian": true,
      "isGlutenFree": false,
      "spiceLevel": "medium",
      "mealTime": ["dinner"],
      "image": "https://..."
    }
  ]
}
```

### 3.4 Get Restaurant Reviews

**Endpoint**: `GET /restaurants/:id/reviews`

**Query Parameters**:
- `page` (number, default: 1)
- `pageSize` (number, default: 20)
- `sort` (string): `recent`, `rating`, `helpful`

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": {
        "id": 123,
        "username": "john_doe",
        "displayName": "John Doe",
        "avatar": "https://..."
      },
      "rating": 9.0,
      "content": "Incredible pasta! The spicy rigatoni is a must-try.",
      "photos": ["https://...", "https://..."],
      "tags": ["pasta", "italian", "date_night"],
      "helpfulCount": 42,
      "isHelpful": false,
      "createdAt": "2025-01-15T19:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1247
  }
}
```

### 3.5 Create Restaurant (Admin Only)

**Endpoint**: `POST /restaurants`

**Headers**: Authorization required (admin role)

**Request Body**:
```json
{
  "name": "New Restaurant",
  "cuisines": ["italian"],
  "priceRange": "$$$",
  "location": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  },
  "phone": "+1-212-555-5678",
  "website": "https://example.com"
}
```

**Response**: 201 Created (full restaurant object)

---

## 4. Lists

### 4.1 Get User Lists

**Endpoint**: `GET /users/:id/lists`

**Query Parameters**:
- `scope` (string, optional): `been`, `want_to_try`, `recs`, `playlists`
- `category` (string, optional): `restaurants`, `bars`, `bakeries`, etc.

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "been-1",
      "scope": "been",
      "category": "restaurants",
      "name": "My Favorites",
      "restaurantCount": 142,
      "thumbnailImage": "https://...",
      "updatedAt": "2025-01-29T12:00:00Z"
    },
    {
      "id": "custom-5",
      "scope": "playlists",
      "category": "restaurants",
      "name": "Date Night Spots",
      "description": "Romantic restaurants for special occasions",
      "restaurantCount": 12,
      "isPublic": true,
      "thumbnailImage": "https://...",
      "createdAt": "2025-01-20T10:00:00Z",
      "updatedAt": "2025-01-28T15:30:00Z"
    }
  ]
}
```

### 4.2 Get List Details

**Endpoint**: `GET /lists/:id`

**Query Parameters**:
- `page` (number, default: 1)
- `pageSize` (number, default: 20)
- `sort` (string): `rank`, `rating`, `name`, `date_added`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "id": "been-1",
    "scope": "been",
    "category": "restaurants",
    "name": "My Favorites",
    "description": null,
    "restaurantCount": 142,
    "isPublic": false,
    "thumbnailImage": "https://...",
    "restaurants": [
      {
        "id": 1,
        "name": "Carbone",
        "rating": 9.2,
        "userRating": 9.0,
        "rankIndex": 1,
        "images": ["https://..."],
        "cuisines": ["italian"],
        "priceRange": "$$$$",
        "location": {
          "neighborhood": "Greenwich Village",
          "city": "New York"
        },
        "notes": "Amazing pasta!",
        "visitDate": "2025-01-15",
        "addedAt": "2025-01-15T20:00:00Z"
      }
    ],
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2025-01-29T12:00:00Z"
  },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 142
  }
}
```

### 4.3 Add Restaurant to List

**Endpoint**: `POST /users/me/lists/:scope/restaurants`

**Headers**: Authorization required

**Request Body**:
```json
{
  "restaurantId": 1,
  "rating": 9.0,
  "notes": "Amazing pasta! Go early.",
  "visitDate": "2025-01-15",
  "tags": ["pasta", "italian", "date_night"],
  "photos": ["https://...", "https://..."]
}
```

**Response**: 201 Created
```json
{
  "success": true,
  "data": {
    "id": "rel-123",
    "restaurantId": 1,
    "status": "been",
    "rating": 9.0,
    "rankIndex": null,
    "notes": "Amazing pasta! Go early.",
    "visitDate": "2025-01-15",
    "tags": ["pasta", "italian", "date_night"],
    "photos": ["https://...", "https://..."],
    "createdAt": "2025-01-15T20:00:00Z"
  }
}
```

### 4.4 Remove Restaurant from List

**Endpoint**: `DELETE /users/me/lists/:scope/restaurants/:restaurantId`

**Headers**: Authorization required

**Response**: 204 No Content

### 4.5 Update Restaurant in List

**Endpoint**: `PATCH /users/me/lists/:scope/restaurants/:restaurantId`

**Headers**: Authorization required

**Request Body** (all fields optional):
```json
{
  "rating": 9.5,
  "notes": "Updated notes",
  "tags": ["updated", "tags"],
  "visitDate": "2025-01-20"
}
```

**Response**: 200 OK (full relation object)

### 4.6 Rank Restaurant

**Endpoint**: `POST /users/me/lists/been/restaurants/:restaurantId/rank`

**Headers**: Authorization required

**Request Body**:
```json
{
  "rankIndex": 3
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "restaurantId": 1,
    "rankIndex": 3,
    "previousRankIndex": 5
  }
}
```

### 4.7 Create Custom List

**Endpoint**: `POST /users/me/lists`

**Headers**: Authorization required

**Request Body**:
```json
{
  "name": "Date Night Spots",
  "description": "Romantic restaurants for special occasions",
  "category": "restaurants",
  "isPublic": true,
  "restaurantIds": [1, 5, 12]
}
```

**Response**: 201 Created (full list object)

### 4.8 Update Custom List

**Endpoint**: `PATCH /lists/:id`

**Headers**: Authorization required

**Request Body** (all fields optional):
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "isPublic": false
}
```

**Response**: 200 OK (full list object)

### 4.9 Delete Custom List

**Endpoint**: `DELETE /lists/:id`

**Headers**: Authorization required

**Response**: 204 No Content

---

## 5. Reviews

### 5.1 Create Review

**Endpoint**: `POST /restaurants/:id/reviews`

**Headers**: Authorization required

**Request Body**:
```json
{
  "rating": 9.0,
  "content": "Incredible pasta! The spicy rigatoni is a must-try.",
  "tags": ["pasta", "italian", "date_night"],
  "photos": ["uuid1", "uuid2"]
}
```

**Response**: 201 Created
```json
{
  "success": true,
  "data": {
    "id": 1,
    "restaurantId": 1,
    "userId": 123,
    "rating": 9.0,
    "content": "Incredible pasta!...",
    "tags": ["pasta", "italian", "date_night"],
    "photos": ["https://...", "https://..."],
    "helpfulCount": 0,
    "createdAt": "2025-01-29T12:00:00Z"
  }
}
```

### 5.2 Update Review

**Endpoint**: `PATCH /reviews/:id`

**Headers**: Authorization required

**Request Body** (all fields optional):
```json
{
  "rating": 9.5,
  "content": "Updated review content",
  "tags": ["updated", "tags"]
}
```

**Response**: 200 OK (full review object)

### 5.3 Delete Review

**Endpoint**: `DELETE /reviews/:id`

**Headers**: Authorization required

**Response**: 204 No Content

### 5.4 Mark Review as Helpful

**Endpoint**: `POST /reviews/:id/helpful`

**Headers**: Authorization required

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "reviewId": 1,
    "helpfulCount": 43,
    "isHelpful": true
  }
}
```

### 5.5 Unmark Review as Helpful

**Endpoint**: `DELETE /reviews/:id/helpful`

**Headers**: Authorization required

**Response**: 200 OK (same as mark helpful)

---

## 6. Social / Feed

### 6.1 Get Activity Feed

**Endpoint**: `GET /feed`

**Headers**: Authorization required

**Query Parameters**:
- `cursor` (string, optional): Pagination cursor
- `limit` (number, default: 20): Items per page
- `userId` (number, optional): Filter by specific user

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "feed-123",
      "type": "visit",
      "user": {
        "id": 123,
        "username": "john_doe",
        "displayName": "John Doe",
        "avatar": "https://..."
      },
      "restaurant": {
        "id": 1,
        "name": "Carbone",
        "images": ["https://..."],
        "cuisines": ["italian"]
      },
      "rating": 9.0,
      "comment": "Amazing pasta!",
      "photos": ["https://...", "https://..."],
      "tags": ["pasta", "italian"],
      "likes": 42,
      "comments": 8,
      "bookmarks": 5,
      "isLiked": false,
      "isBookmarked": false,
      "createdAt": "2025-01-29T12:00:00Z"
    }
  ],
  "meta": {
    "nextCursor": "eyJpZCI6ImZlZWQtMTQzIn0",
    "hasMore": true
  }
}
```

### 6.2 Like Activity

**Endpoint**: `POST /feed/:id/like`

**Headers**: Authorization required

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "activityId": "feed-123",
    "likes": 43,
    "isLiked": true
  }
}
```

### 6.3 Unlike Activity

**Endpoint**: `DELETE /feed/:id/like`

**Headers**: Authorization required

**Response**: 200 OK (same as like)

### 6.4 Bookmark Activity

**Endpoint**: `POST /feed/:id/bookmark`

**Headers**: Authorization required

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "activityId": "feed-123",
    "bookmarks": 6,
    "isBookmarked": true
  }
}
```

### 6.5 Unbookmark Activity

**Endpoint**: `DELETE /feed/:id/bookmark`

**Headers**: Authorization required

**Response**: 200 OK (same as bookmark)

### 6.6 Comment on Activity

**Endpoint**: `POST /feed/:id/comments`

**Headers**: Authorization required

**Request Body**:
```json
{
  "content": "Looks amazing! Can't wait to try."
}
```

**Response**: 201 Created
```json
{
  "success": true,
  "data": {
    "id": "comment-456",
    "activityId": "feed-123",
    "user": {
      "id": 456,
      "username": "jane_smith",
      "displayName": "Jane Smith",
      "avatar": "https://..."
    },
    "content": "Looks amazing! Can't wait to try.",
    "createdAt": "2025-01-29T12:05:00Z"
  }
}
```

### 6.7 Follow User

**Endpoint**: `POST /users/:id/follow`

**Headers**: Authorization required

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "userId": 123,
    "isFollowing": true,
    "followersCount": 54
  }
}
```

### 6.8 Unfollow User

**Endpoint**: `DELETE /users/:id/follow`

**Headers**: Authorization required

**Response**: 200 OK (same as follow)

### 6.9 Get Followers

**Endpoint**: `GET /users/:id/followers`

**Query Parameters**:
- `page` (number, default: 1)
- `pageSize` (number, default: 20)

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": 456,
      "username": "jane_smith",
      "displayName": "Jane Smith",
      "avatar": "https://...",
      "beenCount": 89,
      "followersCount": 42,
      "isFollowing": true
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 53
  }
}
```

### 6.10 Get Following

**Endpoint**: `GET /users/:id/following`

**Response**: 200 OK (same structure as followers)

### 6.11 Get Match Percentage

**Endpoint**: `GET /users/:id/match`

**Headers**: Authorization required

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "userId": 123,
    "matchPercentage": 87,
    "sharedRestaurants": 34,
    "totalRestaurants": 142,
    "topSharedCuisines": ["italian", "japanese"]
  }
}
```

---

## 7. Leaderboard

### 7.1 Get Leaderboard

**Endpoint**: `GET /leaderboard`

**Headers**: Authorization required

**Query Parameters**:
- `page` (number, default: 1)
- `pageSize` (number, default: 20)
- `city` (string, optional): Filter by city

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "user": {
        "id": 123,
        "username": "john_doe",
        "displayName": "John Doe",
        "avatar": "https://...",
        "location": {
          "city": "New York",
          "state": "NY"
        }
      },
      "stats": {
        "beenCount": 342,
        "currentStreak": 45,
        "averageRating": 8.2
      },
      "isFollowing": true
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150
  }
}
```

---

## 8. Tastemakers

### 8.1 Get All Tastemakers

**Endpoint**: `GET /tastemakers`

**Query Parameters**:
- `page` (number, default: 1)
- `pageSize` (number, default: 20)
- `specialty` (string, optional): Filter by specialty

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": 201,
      "username": "pizza_queen",
      "displayName": "Sarah Chen",
      "avatar": "https://...",
      "bio": "NYC pizza expert...",
      "specialty": "Pizza",
      "tagline": "Finding the perfect slice",
      "badges": [
        {
          "type": "pizza_expert",
          "label": "Pizza Expert",
          "color": "#FF6B35"
        }
      ],
      "socialLinks": {
        "instagram": "sarahlovespizza",
        "tiktok": "pizzaqueen"
      },
      "stats": {
        "followersCount": 8234,
        "postsCount": 47,
        "restaurantsCount": 156
      },
      "isFollowing": false
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 13
  }
}
```

### 8.2 Get Tastemaker Details

**Endpoint**: `GET /tastemakers/:id`

**Response**: 200 OK (full tastemaker object with recent posts)

### 8.3 Get Tastemaker Posts

**Endpoint**: `GET /tastemakers/:id/posts`

**Query Parameters**:
- `page` (number, default: 1)
- `pageSize` (number, default: 10)
- `featured` (boolean, optional): Filter featured posts

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "post-123",
      "author": {
        "id": 201,
        "username": "pizza_queen",
        "displayName": "Sarah Chen",
        "avatar": "https://..."
      },
      "title": "The 10 Best Pizza Spots in Brooklyn",
      "subtitle": "From classic NY slices to Neapolitan perfection",
      "coverImage": "https://...",
      "excerpt": "After trying over 50 pizza places...",
      "tags": ["pizza", "brooklyn", "guide"],
      "isFeatured": true,
      "restaurantCount": 10,
      "views": 12453,
      "likes": 1234,
      "bookmarks": 456,
      "isLiked": false,
      "isBookmarked": false,
      "publishedAt": "2025-01-20T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 47
  }
}
```

### 8.4 Get Post Details

**Endpoint**: `GET /tastemakers/posts/:id`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "id": "post-123",
    "author": {
      "id": 201,
      "username": "pizza_queen",
      "displayName": "Sarah Chen",
      "avatar": "https://...",
      "badges": [...]
    },
    "title": "The 10 Best Pizza Spots in Brooklyn",
    "subtitle": "From classic NY slices to Neapolitan perfection",
    "coverImage": "https://...",
    "content": "<p>After trying over 50 pizza places...</p>",
    "restaurants": [
      {
        "id": 1,
        "name": "Lucali",
        "rating": 9.5,
        "images": ["https://..."],
        "location": { ... }
      }
    ],
    "lists": [
      {
        "id": "list-456",
        "name": "Sarah's Pizza Favorites",
        "restaurantCount": 10
      }
    ],
    "tags": ["pizza", "brooklyn", "guide"],
    "isFeatured": true,
    "views": 12453,
    "likes": 1234,
    "bookmarks": 456,
    "comments": 89,
    "isLiked": false,
    "isBookmarked": false,
    "publishedAt": "2025-01-20T10:00:00Z",
    "updatedAt": "2025-01-21T14:30:00Z"
  }
}
```

### 8.5 Like Tastemaker Post

**Endpoint**: `POST /tastemakers/posts/:id/like`

**Headers**: Authorization required

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "postId": "post-123",
    "likes": 1235,
    "isLiked": true
  }
}
```

### 8.6 Unlike Tastemaker Post

**Endpoint**: `DELETE /tastemakers/posts/:id/like`

**Headers**: Authorization required

**Response**: 200 OK (same as like)

### 8.7 Bookmark Tastemaker Post

**Endpoint**: `POST /tastemakers/posts/:id/bookmark`

**Headers**: Authorization required

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "postId": "post-123",
    "bookmarks": 457,
    "isBookmarked": true
  }
}
```

---

## 9. Group Dinner

### 9.1 Create Match Session

**Endpoint**: `POST /groups/matches`

**Headers**: Authorization required

**Request Body**:
```json
{
  "participantIds": [123, 456, 789],
  "date": "2025-02-01",
  "timeSlot": "dinner",
  "dietaryRestrictions": ["vegetarian"]
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "sessionId": "session-abc123",
    "participants": [
      {
        "id": 123,
        "displayName": "John Doe",
        "avatar": "https://..."
      }
    ],
    "matches": [
      {
        "restaurant": {
          "id": 1,
          "name": "Carbone",
          "images": ["https://..."],
          "cuisines": ["italian"],
          "rating": 9.2,
          "priceRange": "$$$$",
          "location": {
            "neighborhood": "Greenwich Village",
            "city": "New York"
          }
        },
        "score": 92,
        "matchReasons": [
          "3 out of 3 people want to try",
          "Perfect for special occasions",
          "Highly rated by your group"
        ],
        "availability": {
          "date": "2025-02-01",
          "timeSlot": "dinner",
          "reservationLink": "https://resy.com/..."
        }
      }
    ],
    "createdAt": "2025-01-29T12:00:00Z"
  }
}
```

### 9.2 Get Match Session

**Endpoint**: `GET /groups/matches/:sessionId`

**Headers**: Authorization required

**Response**: 200 OK (same as create)

### 9.3 Submit Restaurant Vote

**Endpoint**: `POST /groups/matches/:sessionId/vote`

**Headers**: Authorization required

**Request Body**:
```json
{
  "restaurantId": 1,
  "vote": "yes"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "sessionId": "session-abc123",
    "restaurantId": 1,
    "vote": "yes",
    "totalVotes": {
      "yes": 2,
      "no": 1
    }
  }
}
```

---

## 10. What to Order

### 10.1 Get Recommendations

**Endpoint**: `GET /restaurants/:id/recommendations`

**Headers**: Authorization required

**Query Parameters**:
- `partySize` (number, required): 1-10
- `hungerLevel` (string, required): `light`, `moderate`, `very-hungry`
- `mealTime` (string, optional): `breakfast`, `lunch`, `dinner`
- `dietaryRestrictions` (string[], optional): Comma-separated

**Example**: `GET /restaurants/1/recommendations?partySize=2&hungerLevel=moderate`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "restaurantId": 1,
    "partySize": 2,
    "hungerLevel": "moderate",
    "items": [
      {
        "id": 1,
        "name": "Spicy Rigatoni",
        "category": "entree",
        "portion": "shareable",
        "price": 38,
        "quantity": 1,
        "popularity": "high"
      },
      {
        "id": 5,
        "name": "Caesar Salad",
        "category": "appetizer",
        "portion": "medium",
        "price": 18,
        "quantity": 1,
        "popularity": "high"
      }
    ],
    "totalPrice": 56,
    "pricePerPerson": 28,
    "reasoning": [
      "Budget-friendly selection for 2 people",
      "Includes crowd favorites",
      "Great for sharing"
    ],
    "estimatedSharability": "Perfect for 2 people with moderate appetite"
  }
}
```

---

## 11. Notifications

### 11.1 Get Notifications

**Endpoint**: `GET /notifications`

**Headers**: Authorization required

**Query Parameters**:
- `cursor` (string, optional): Pagination cursor
- `limit` (number, default: 20)
- `unreadOnly` (boolean, default: false)

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "notif-123",
      "type": "follow",
      "actor": {
        "id": 456,
        "username": "jane_smith",
        "displayName": "Jane Smith",
        "avatar": "https://..."
      },
      "message": "jane_smith started following you",
      "isRead": false,
      "createdAt": "2025-01-29T11:00:00Z"
    },
    {
      "id": "notif-124",
      "type": "rating_liked",
      "actor": {
        "id": 789,
        "username": "bob_jones",
        "displayName": "Bob Jones",
        "avatar": "https://..."
      },
      "restaurant": {
        "id": 1,
        "name": "Carbone",
        "image": "https://..."
      },
      "message": "bob_jones liked your review of Carbone",
      "isRead": true,
      "createdAt": "2025-01-28T19:30:00Z"
    }
  ],
  "meta": {
    "nextCursor": "eyJpZCI6Im5vdGlmLTEzNCJ9",
    "hasMore": true,
    "unreadCount": 5
  }
}
```

### 11.2 Mark Notification as Read

**Endpoint**: `PATCH /notifications/:id/read`

**Headers**: Authorization required

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "notificationId": "notif-123",
    "isRead": true
  }
}
```

### 11.3 Mark All as Read

**Endpoint**: `POST /notifications/read-all`

**Headers**: Authorization required

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "markedCount": 5
  }
}
```

### 11.4 Get Unread Count

**Endpoint**: `GET /notifications/unread-count`

**Headers**: Authorization required

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

---

## 12. Search

### 12.1 Global Search

**Endpoint**: `GET /search`

**Query Parameters**:
- `q` (string, required): Search query
- `type` (string, optional): `restaurants`, `users`, `tastemakers`, `all` (default)
- `limit` (number, default: 20)

**Example**: `GET /search?q=pizza&type=restaurants`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "restaurants": [
      {
        "id": 1,
        "name": "Joe's Pizza",
        "rating": 8.5,
        "images": ["https://..."],
        "cuisines": ["pizza"],
        "location": { ... }
      }
    ],
    "users": [
      {
        "id": 123,
        "username": "pizza_lover",
        "displayName": "Pizza Lover",
        "avatar": "https://..."
      }
    ],
    "tastemakers": [],
    "totalResults": 47
  }
}
```

### 12.2 Recent Searches

**Endpoint**: `GET /search/recent`

**Headers**: Authorization required

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "search-1",
      "type": "restaurant",
      "restaurant": {
        "id": 1,
        "name": "Carbone",
        "images": ["https://..."]
      },
      "searchedAt": "2025-01-29T11:00:00Z"
    },
    {
      "id": "search-2",
      "type": "query",
      "query": "best pizza",
      "searchedAt": "2025-01-28T15:00:00Z"
    }
  ]
}
```

### 12.3 Clear Recent Searches

**Endpoint**: `DELETE /search/recent`

**Headers**: Authorization required

**Response**: 204 No Content

---

## 13. Featured Lists

### 13.1 Get Featured Lists

**Endpoint**: `GET /featured-lists`

**Query Parameters**:
- `page` (number, default: 1)
- `pageSize` (number, default: 20)

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "featured-pizza",
      "name": "Top 10 Pizza in NYC",
      "description": "The absolute best pizza spots...",
      "curator": {
        "id": 1,
        "displayName": "Beli Team",
        "avatar": "https://..."
      },
      "restaurantCount": 10,
      "thumbnailImage": "https://...",
      "tags": ["pizza", "nyc"],
      "bookmarkCount": 3245,
      "isBookmarked": false,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 25
  }
}
```

### 13.2 Get Featured List Details

**Endpoint**: `GET /featured-lists/:id`

**Response**: 200 OK (full list with restaurants)

### 13.3 Get List Progress

**Endpoint**: `GET /featured-lists/:id/progress`

**Headers**: Authorization required

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "listId": "featured-pizza",
    "totalRestaurants": 10,
    "visitedCount": 3,
    "progressPercentage": 30,
    "visitedRestaurantIds": [1, 5, 8]
  }
}
```

---

## 14. Reservations

### 14.1 Get Available Reservations

**Endpoint**: `GET /reservations`

**Headers**: Authorization required

**Query Parameters**:
- `status` (string, optional): `available`, `claimed`, `shared`
- `page` (number, default: 1)
- `pageSize` (number, default: 20)

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "res-123",
      "restaurant": {
        "id": 1,
        "name": "Carbone",
        "images": ["https://..."],
        "location": { ... }
      },
      "date": "2025-02-01",
      "time": "19:00",
      "partySize": 2,
      "priority": "SC",
      "status": "available",
      "owner": {
        "id": 123,
        "displayName": "John Doe",
        "avatar": "https://..."
      },
      "expiresAt": "2025-01-30T12:00:00Z",
      "createdAt": "2025-01-29T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 15
  }
}
```

### 14.2 Claim Reservation

**Endpoint**: `POST /reservations/:id/claim`

**Headers**: Authorization required

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "id": "res-123",
    "status": "claimed",
    "claimedBy": {
      "id": 456,
      "displayName": "Jane Smith"
    },
    "claimedAt": "2025-01-29T12:05:00Z"
  }
}
```

### 14.3 Share Reservation

**Endpoint**: `POST /reservations/:id/share`

**Headers**: Authorization required

**Request Body**:
```json
{
  "recipientIds": [456, 789]
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "id": "res-123",
    "status": "shared",
    "sharedWith": [456, 789],
    "sharedAt": "2025-01-29T12:10:00Z"
  }
}
```

### 14.4 Get Reservation Priority

**Endpoint**: `GET /users/me/reservation-priority`

**Headers**: Authorization required

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "level": "Gold",
    "invitesSent": 8,
    "reservationsShared": 5,
    "nextLevel": "SC",
    "nextLevelRequirements": {
      "invitesSent": 15,
      "reservationsShared": 10
    },
    "progress": {
      "invites": 53,
      "shares": 50
    }
  }
}
```

---

## 15. Taste Profile

### 15.1 Get Taste Profile

**Endpoint**: `GET /users/:id/taste-profile`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "userId": 123,
    "last30Days": {
      "restaurantCount": 12,
      "cuisineCount": 8,
      "activityPercentile": 85,
      "primaryLocation": {
        "city": "New York",
        "state": "NY"
      }
    },
    "cuisineBreakdown": [
      {
        "cuisine": "italian",
        "count": 32,
        "avgScore": 8.5,
        "restaurantIds": [1, 5, 12]
      },
      {
        "cuisine": "japanese",
        "count": 28,
        "avgScore": 8.8,
        "restaurantIds": [2, 8, 15]
      }
    ],
    "cityBreakdown": [
      {
        "city": "New York",
        "state": "NY",
        "count": 142,
        "avgScore": 8.3,
        "restaurantIds": [...]
      }
    ],
    "countryBreakdown": [
      {
        "country": "United States",
        "count": 142,
        "avgScore": 8.3
      }
    ],
    "diningLocations": [
      {
        "latitude": 40.7308,
        "longitude": -74.0023,
        "restaurantCount": 5
      }
    ],
    "totals": {
      "totalRestaurants": 142,
      "totalCities": 3,
      "totalCountries": 1,
      "totalCuisines": 15
    }
  }
}
```

---

## WebSocket Events

### Connection

**URL**: `wss://api.beli.app/ws`

**Authentication**: Query parameter `token=<jwt_token>`

**Example**: `wss://api.beli.app/ws?token=eyJhbGci...`

### Events (Server → Client)

#### notification:new
```json
{
  "event": "notification:new",
  "data": {
    "id": "notif-123",
    "type": "follow",
    "actor": { ... },
    "message": "...",
    "createdAt": "2025-01-29T12:00:00Z"
  }
}
```

#### feed:update
```json
{
  "event": "feed:update",
  "data": {
    "activityId": "feed-123",
    "type": "visit",
    "user": { ... },
    "restaurant": { ... }
  }
}
```

#### group:vote
```json
{
  "event": "group:vote",
  "data": {
    "sessionId": "session-abc123",
    "userId": 456,
    "restaurantId": 1,
    "vote": "yes"
  }
}
```

### Events (Client → Server)

#### join_room
```json
{
  "event": "join_room",
  "data": {
    "room": "user:123"
  }
}
```

#### leave_room
```json
{
  "event": "leave_room",
  "data": {
    "room": "user:123"
  }
}
```

---

## Rate Limiting

### Limits by Endpoint Type

| Endpoint Type | Limit | Window |
|--------------|-------|---------|
| Authentication | 5 requests | 15 min |
| Read operations (GET) | 100 requests | 1 min |
| Write operations (POST/PATCH/DELETE) | 30 requests | 1 min |
| Search | 20 requests | 1 min |
| Upload | 10 requests | 1 min |

### Rate Limit Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1640000000
```

### Rate Limit Exceeded Response

**Status**: 429 Too Many Requests

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Try again in 45 seconds.",
    "retryAfter": 45,
    "limit": 100,
    "windowMs": 60000
  }
}
```

---

## Pagination

### Cursor-Based Pagination (for feeds)

**Request**: `GET /feed?cursor=eyJpZCI6MTIzfQ&limit=20`

**Response**:
```json
{
  "data": [...],
  "meta": {
    "nextCursor": "eyJpZCI6MTQzfQ",
    "hasMore": true
  }
}
```

### Offset-Based Pagination (for lists)

**Request**: `GET /restaurants?page=2&pageSize=20`

**Response**:
```json
{
  "data": [...],
  "meta": {
    "page": 2,
    "pageSize": 20,
    "total": 250,
    "totalPages": 13,
    "hasMore": true
  }
}
```

---

## Image Upload

### Process

1. Request pre-signed URL
2. Upload directly to S3
3. Send image UUID to API endpoint

### 1. Request Upload URL

**Endpoint**: `POST /upload/presigned-url`

**Headers**: Authorization required

**Request Body**:
```json
{
  "fileType": "image/jpeg",
  "category": "review_photo"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/beli-prod/...",
    "imageId": "uuid-123",
    "expiresIn": 300
  }
}
```

### 2. Upload to S3

**Method**: PUT to `uploadUrl`

**Headers**: `Content-Type: image/jpeg`

**Body**: Binary image data

### 3. Confirm Upload

Include `imageId` in subsequent API calls (e.g., create review)

---

## Versioning

### API Version

Current version: **v1**

**URL Format**: `https://api.beli.app/api/v1/*`

### Breaking Changes

Breaking changes will result in a new API version (v2). Older versions will be supported for minimum 6 months after deprecation notice.

### Changelog

See [API Changelog](./api-changelog.md) for version history and migration guides.

---

## Testing

### Test Environment

**Base URL**: `https://api-staging.beli.app/api/v1`

### Test Credentials

Test accounts available in staging:
- Email: `test@beli.app`
- Password: `TestPassword123`

### Postman Collection

Download: [Beli API Postman Collection](./beli-api.postman_collection.json)

---

## Support

For API questions and issues:
- Email: api-support@beli.app
- Developer Portal: https://developers.beli.app
- Status Page: https://status.beli.app

---

## Next Steps

1. Review [backend-architecture.md](./backend-architecture.md) for system design
2. Study [backend-database-schema.md](./backend-database-schema.md) for data models
3. Read [backend-business-logic.md](./backend-business-logic.md) for algorithms
4. Follow [backend-integration-guide.md](./backend-integration-guide.md) for implementation
