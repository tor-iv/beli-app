# Beli Database Schema

## Overview

This document defines the complete PostgreSQL database schema for the Beli application, including all tables, relationships, indexes, and constraints.

**Database**: PostgreSQL 15+
**Extensions**: PostGIS (for geographic queries), pg_trgm (for fuzzy text search)

---

## Table of Contents

1. [Users & Authentication](#users--authentication)
2. [Restaurants](#restaurants)
3. [User-Restaurant Relations](#user-restaurant-relations)
4. [Reviews](#reviews)
5. [Social Features](#social-features)
6. [Lists](#lists)
7. [Tastemakers](#tastemakers)
8. [Activity Feed](#activity-feed)
9. [Notifications](#notifications)
10. [Reservations](#reservations)
11. [Supporting Tables](#supporting-tables)
12. [Indexes](#indexes)
13. [Migrations](#migrations)

---

## Schema Diagram

```
┌──────────────┐         ┌─────────────────┐         ┌───────────────┐
│    users     │────────▶│ user_relations  │◀────────│  restaurants  │
└──────────────┘         └─────────────────┘         └───────────────┘
       │                          │                           │
       │                          │                           │
       ▼                          ▼                           ▼
┌──────────────┐         ┌─────────────────┐         ┌───────────────┐
│   follows    │         │    reviews      │         │  menu_items   │
└──────────────┘         └─────────────────┘         └───────────────┘
       │                                                      │
       │                 ┌─────────────────┐                 │
       └────────────────▶│ activity_feed   │◀────────────────┘
                         └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ notifications   │
                         └─────────────────┘
```

---

## 1. Users & Authentication

### users

Primary table for user accounts and profiles.

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255), -- NULL for OAuth users
  display_name VARCHAR(100) NOT NULL,
  bio TEXT,
  avatar VARCHAR(500),

  -- Location
  city VARCHAR(100),
  state VARCHAR(50),
  country VARCHAR(100) DEFAULT 'United States',

  -- Preferences
  dietary_restrictions TEXT[], -- e.g., ['vegetarian', 'gluten-free']
  disliked_cuisines TEXT[], -- e.g., ['indian', 'seafood']

  -- Stats (denormalized for performance)
  been_count INTEGER DEFAULT 0,
  want_to_try_count INTEGER DEFAULT 0,
  recommendations_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  rank INTEGER,

  -- Tastemaker fields (NULL for regular users)
  is_tastemaker BOOLEAN DEFAULT FALSE,
  tastemaker_specialty VARCHAR(100),
  tastemaker_tagline VARCHAR(200),
  tastemaker_badges JSONB, -- Array of badge objects
  social_links JSONB, -- { instagram: '', tiktok: '', twitter: '' }

  -- Challenge 2025
  challenge_year INTEGER DEFAULT 2025,
  challenge_goal INTEGER DEFAULT 100,
  challenge_current INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_tastemaker ON users(is_tastemaker) WHERE is_tastemaker = TRUE;
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_city_state ON users(city, state) WHERE deleted_at IS NULL;
```

### oauth_accounts

OAuth provider accounts linked to users.

```sql
CREATE TABLE oauth_accounts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'google', 'apple'
  provider_user_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_oauth_user_id ON oauth_accounts(user_id);
CREATE INDEX idx_oauth_provider ON oauth_accounts(provider, provider_user_id);
```

### refresh_tokens

Stores refresh tokens for JWT authentication.

```sql
CREATE TABLE refresh_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE -- NULL if active
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token) WHERE revoked_at IS NULL;
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at) WHERE revoked_at IS NULL;
```

---

## 2. Restaurants

### restaurants

Core restaurant data.

```sql
CREATE TABLE restaurants (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cuisines TEXT[] NOT NULL, -- ['italian', 'pizza']
  category VARCHAR(50) DEFAULT 'restaurants', -- restaurants/bars/bakeries/coffee_tea/dessert/other
  price_range VARCHAR(10), -- $, $$, $$$, $$$$

  -- Location
  address VARCHAR(500),
  neighborhood VARCHAR(100),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  country VARCHAR(100) DEFAULT 'United States',
  zip_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Contact
  phone VARCHAR(50),
  website VARCHAR(500),

  -- Hours (stored as JSONB for flexibility)
  hours JSONB, -- { monday: { open: '17:00', close: '23:00' }, ... }

  -- Features
  accepts_reservations BOOLEAN DEFAULT FALSE,
  reservation_link VARCHAR(500),

  -- Metadata
  tags TEXT[], -- ['romantic', 'special_occasion', 'outdoor_seating']
  popular_dishes TEXT[], -- ['Spicy Rigatoni', 'Veal Parmesan']
  images TEXT[], -- Array of image URLs

  -- Scores (denormalized, updated via triggers/jobs)
  rec_score DECIMAL(3, 1) DEFAULT 0, -- 0-10
  friend_score DECIMAL(3, 1) DEFAULT 0, -- 0-10
  average_score DECIMAL(3, 1) DEFAULT 0, -- 0-10
  rec_score_sample_size INTEGER DEFAULT 0,
  friend_score_sample_size INTEGER DEFAULT 0,
  average_score_sample_size INTEGER DEFAULT 0,
  rating_count INTEGER DEFAULT 0,

  -- Admin
  created_by BIGINT REFERENCES users(id),
  verified BOOLEAN DEFAULT FALSE, -- Admin-verified data

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- Indexes
CREATE INDEX idx_restaurants_name ON restaurants USING gin(name gin_trgm_ops);
CREATE INDEX idx_restaurants_cuisines ON restaurants USING gin(cuisines);
CREATE INDEX idx_restaurants_city_state ON restaurants(city, state) WHERE deleted_at IS NULL;
CREATE INDEX idx_restaurants_location ON restaurants USING gist(ST_MakePoint(longitude, latitude));
CREATE INDEX idx_restaurants_category ON restaurants(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_restaurants_average_score ON restaurants(average_score DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_restaurants_deleted_at ON restaurants(deleted_at) WHERE deleted_at IS NULL;
```

### menu_items

Menu items for each restaurant.

```sql
CREATE TABLE menu_items (
  id BIGSERIAL PRIMARY KEY,
  restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- appetizer/entree/side/dessert/drink
  price DECIMAL(8, 2),

  -- Metadata
  portion VARCHAR(50), -- small/medium/large/shareable
  popularity VARCHAR(20), -- low/medium/high
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_vegan BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  spice_level VARCHAR(20), -- mild/medium/hot
  meal_time TEXT[], -- ['breakfast', 'lunch', 'dinner']

  -- Media
  image VARCHAR(500),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_popularity ON menu_items(popularity);
```

---

## 3. User-Restaurant Relations

### user_restaurant_relations

Tracks user's relationship with restaurants (been/want-to-try/recommended).

```sql
CREATE TABLE user_restaurant_relations (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

  -- Relation type
  status VARCHAR(20) NOT NULL, -- 'been', 'want_to_try', 'recommended'

  -- Rating (for 'been' status)
  rating DECIMAL(3, 1), -- 0-10, NULL if not rated
  rank_index INTEGER, -- Position in ranked list (for 'been' status)

  -- Metadata
  notes TEXT,
  tags TEXT[], -- User-defined tags
  photos TEXT[], -- User-uploaded photo URLs
  visit_date DATE,
  companions BIGINT[], -- Array of user IDs who joined

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, restaurant_id, status)
);

CREATE INDEX idx_urr_user_id ON user_restaurant_relations(user_id);
CREATE INDEX idx_urr_restaurant_id ON user_restaurant_relations(restaurant_id);
CREATE INDEX idx_urr_status ON user_restaurant_relations(status);
CREATE INDEX idx_urr_user_status ON user_restaurant_relations(user_id, status);
CREATE INDEX idx_urr_rank ON user_restaurant_relations(user_id, rank_index) WHERE rank_index IS NOT NULL;
CREATE INDEX idx_urr_visit_date ON user_restaurant_relations(visit_date) WHERE visit_date IS NOT NULL;
```

---

## 4. Reviews

### reviews

Detailed reviews separate from relations (allows reviews without been status).

```sql
CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

  -- Content
  rating DECIMAL(3, 1) NOT NULL, -- 0-10
  content TEXT NOT NULL,
  tags TEXT[],
  photos TEXT[], -- Array of image URLs

  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

CREATE INDEX idx_reviews_user_id ON reviews(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_reviews_restaurant_id ON reviews(restaurant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_reviews_helpful_count ON reviews(helpful_count DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC) WHERE deleted_at IS NULL;
```

### review_helpful

Tracks which users found reviews helpful.

```sql
CREATE TABLE review_helpful (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(review_id, user_id)
);

CREATE INDEX idx_review_helpful_review_id ON review_helpful(review_id);
CREATE INDEX idx_review_helpful_user_id ON review_helpful(user_id);
```

---

## 5. Social Features

### follows

User following relationships.

```sql
CREATE TABLE follows (
  id BIGSERIAL PRIMARY KEY,
  follower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
```

### match_cache

Cached match percentages between users.

```sql
CREATE TABLE match_cache (
  id BIGSERIAL PRIMARY KEY,
  user1_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_percentage INTEGER NOT NULL, -- 0-100
  shared_restaurants_count INTEGER DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id) -- Ensures consistent ordering
);

CREATE INDEX idx_match_cache_user1 ON match_cache(user1_id);
CREATE INDEX idx_match_cache_user2 ON match_cache(user2_id);
CREATE INDEX idx_match_cache_expires ON match_cache(expires_at);
```

---

## 6. Lists

### lists

User-created lists (custom playlists).

```sql
CREATE TABLE lists (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Metadata
  name VARCHAR(255) NOT NULL,
  description TEXT,
  scope VARCHAR(20) NOT NULL, -- 'playlists' (been/want-to-try stored in user_restaurant_relations)
  category VARCHAR(50) DEFAULT 'restaurants', -- restaurants/bars/bakeries/etc.

  -- Privacy
  is_public BOOLEAN DEFAULT FALSE,

  -- Stats
  restaurant_count INTEGER DEFAULT 0,
  thumbnail_image VARCHAR(500),
  bookmark_count INTEGER DEFAULT 0,

  -- Featured (admin curated)
  is_featured BOOLEAN DEFAULT FALSE,
  featured_order INTEGER, -- Display order for featured lists

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

CREATE INDEX idx_lists_user_id ON lists(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_lists_is_public ON lists(is_public) WHERE is_public = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_lists_is_featured ON lists(is_featured, featured_order) WHERE is_featured = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_lists_category ON lists(category) WHERE deleted_at IS NULL;
```

### list_restaurants

Junction table for lists and restaurants.

```sql
CREATE TABLE list_restaurants (
  id BIGSERIAL PRIMARY KEY,
  list_id BIGINT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  position INTEGER, -- Order in list
  added_by BIGINT REFERENCES users(id), -- Who added it
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(list_id, restaurant_id)
);

CREATE INDEX idx_list_restaurants_list_id ON list_restaurants(list_id);
CREATE INDEX idx_list_restaurants_restaurant_id ON list_restaurants(restaurant_id);
CREATE INDEX idx_list_restaurants_position ON list_restaurants(list_id, position);
```

### list_bookmarks

Users who bookmarked lists.

```sql
CREATE TABLE list_bookmarks (
  id BIGSERIAL PRIMARY KEY,
  list_id BIGINT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(list_id, user_id)
);

CREATE INDEX idx_list_bookmarks_list_id ON list_bookmarks(list_id);
CREATE INDEX idx_list_bookmarks_user_id ON list_bookmarks(user_id);
```

---

## 7. Tastemakers

### tastemaker_posts

Articles and content from tastemakers.

```sql
CREATE TABLE tastemaker_posts (
  id BIGSERIAL PRIMARY KEY,
  author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Content
  title VARCHAR(500) NOT NULL,
  subtitle VARCHAR(1000),
  content TEXT NOT NULL, -- Rich text HTML
  cover_image VARCHAR(500),

  -- Metadata
  tags TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,

  -- Stats
  views INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,

  -- Timestamps
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

CREATE INDEX idx_tastemaker_posts_author_id ON tastemaker_posts(author_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tastemaker_posts_published_at ON tastemaker_posts(published_at DESC) WHERE published_at IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_tastemaker_posts_is_featured ON tastemaker_posts(is_featured) WHERE is_featured = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_tastemaker_posts_tags ON tastemaker_posts USING gin(tags);
```

### tastemaker_post_restaurants

Restaurants mentioned in tastemaker posts.

```sql
CREATE TABLE tastemaker_post_restaurants (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES tastemaker_posts(id) ON DELETE CASCADE,
  restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  position INTEGER, -- Order in post
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(post_id, restaurant_id)
);

CREATE INDEX idx_tpr_post_id ON tastemaker_post_restaurants(post_id);
CREATE INDEX idx_tpr_restaurant_id ON tastemaker_post_restaurants(restaurant_id);
```

### tastemaker_post_lists

Lists mentioned in tastemaker posts.

```sql
CREATE TABLE tastemaker_post_lists (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES tastemaker_posts(id) ON DELETE CASCADE,
  list_id BIGINT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(post_id, list_id)
);

CREATE INDEX idx_tpl_post_id ON tastemaker_post_lists(post_id);
CREATE INDEX idx_tpl_list_id ON tastemaker_post_lists(list_id);
```

### tastemaker_post_likes

Users who liked tastemaker posts.

```sql
CREATE TABLE tastemaker_post_likes (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES tastemaker_posts(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_tpl_post_id ON tastemaker_post_likes(post_id);
CREATE INDEX idx_tpl_user_id ON tastemaker_post_likes(user_id);
```

### tastemaker_post_bookmarks

Users who bookmarked tastemaker posts.

```sql
CREATE TABLE tastemaker_post_bookmarks (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES tastemaker_posts(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_tpb_post_id ON tastemaker_post_bookmarks(post_id);
CREATE INDEX idx_tpb_user_id ON tastemaker_post_bookmarks(user_id);
```

---

## 8. Activity Feed

### activity_feed

Social activity feed items.

```sql
CREATE TABLE activity_feed (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Activity type
  type VARCHAR(50) NOT NULL, -- visit/review/recommendation/follow/want_to_try/bookmark

  -- References (nullable based on type)
  restaurant_id BIGINT REFERENCES restaurants(id) ON DELETE CASCADE,
  target_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE, -- For follow activities
  list_id BIGINT REFERENCES lists(id) ON DELETE CASCADE,
  review_id BIGINT REFERENCES reviews(id) ON DELETE CASCADE,

  -- Content
  rating DECIMAL(3, 1),
  comment TEXT,
  photos TEXT[],
  tags TEXT[],

  -- Engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

CREATE INDEX idx_activity_feed_user_id ON activity_feed(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_activity_feed_created_at ON activity_feed(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_activity_feed_type ON activity_feed(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_activity_feed_restaurant_id ON activity_feed(restaurant_id) WHERE restaurant_id IS NOT NULL AND deleted_at IS NULL;
```

### activity_likes

Users who liked activity feed items.

```sql
CREATE TABLE activity_likes (
  id BIGSERIAL PRIMARY KEY,
  activity_id BIGINT NOT NULL REFERENCES activity_feed(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(activity_id, user_id)
);

CREATE INDEX idx_activity_likes_activity_id ON activity_likes(activity_id);
CREATE INDEX idx_activity_likes_user_id ON activity_likes(user_id);
```

### activity_bookmarks

Users who bookmarked activity feed items.

```sql
CREATE TABLE activity_bookmarks (
  id BIGSERIAL PRIMARY KEY,
  activity_id BIGINT NOT NULL REFERENCES activity_feed(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(activity_id, user_id)
);

CREATE INDEX idx_activity_bookmarks_activity_id ON activity_bookmarks(activity_id);
CREATE INDEX idx_activity_bookmarks_user_id ON activity_bookmarks(user_id);
```

### activity_comments

Comments on activity feed items.

```sql
CREATE TABLE activity_comments (
  id BIGSERIAL PRIMARY KEY,
  activity_id BIGINT NOT NULL REFERENCES activity_feed(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

CREATE INDEX idx_activity_comments_activity_id ON activity_comments(activity_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_activity_comments_user_id ON activity_comments(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_activity_comments_created_at ON activity_comments(created_at DESC);
```

---

## 9. Notifications

### notifications

User notifications.

```sql
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Type and content
  type VARCHAR(50) NOT NULL, -- follow/rating_liked/comment/bookmark_liked/recommendation/streak/list_bookmark
  message TEXT NOT NULL,

  -- References (nullable based on type)
  actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  restaurant_id BIGINT REFERENCES restaurants(id) ON DELETE CASCADE,
  list_id BIGINT REFERENCES lists(id) ON DELETE CASCADE,
  review_id BIGINT REFERENCES reviews(id) ON DELETE CASCADE,
  activity_id BIGINT REFERENCES activity_feed(id) ON DELETE CASCADE,
  post_id BIGINT REFERENCES tastemaker_posts(id) ON DELETE CASCADE,

  -- Metadata
  metadata JSONB, -- Additional data based on type

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
```

---

## 10. Reservations

### reservations

Available reservations shared by users.

```sql
CREATE TABLE reservations (
  id BIGSERIAL PRIMARY KEY,
  restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

  -- Owner (who has the reservation)
  owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Reservation details
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  party_size INTEGER NOT NULL,

  -- Priority level
  priority VARCHAR(20) NOT NULL, -- SC/Gold/Silver/Bronze

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'available', -- available/claimed/shared/cancelled
  claimed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMP WITH TIME ZONE,

  -- Sharing
  shared_with BIGINT[], -- Array of user IDs

  -- External reference
  external_reservation_id VARCHAR(255), -- Resy/OpenTable ID

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_reservations_owner_id ON reservations(owner_id);
CREATE INDEX idx_reservations_restaurant_id ON reservations(restaurant_id);
CREATE INDEX idx_reservations_status ON reservations(status) WHERE status = 'available';
CREATE INDEX idx_reservations_date ON reservations(reservation_date, reservation_time);
CREATE INDEX idx_reservations_expires_at ON reservations(expires_at);
```

### reservation_priority

Tracks user's reservation sharing priority level.

```sql
CREATE TABLE reservation_priority (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Current level
  level VARCHAR(20) NOT NULL DEFAULT 'Bronze', -- SC/Gold/Silver/Bronze

  -- Progress
  invites_sent INTEGER DEFAULT 0,
  reservations_shared INTEGER DEFAULT 0,

  -- Timestamps
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reservation_priority_user_id ON reservation_priority(user_id);
CREATE INDEX idx_reservation_priority_level ON reservation_priority(level);
```

---

## 11. Supporting Tables

### recent_searches

User's recent search history.

```sql
CREATE TABLE recent_searches (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Search type
  type VARCHAR(50) NOT NULL, -- restaurant/user/query

  -- References
  restaurant_id BIGINT REFERENCES restaurants(id) ON DELETE CASCADE,
  searched_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  query TEXT,

  -- Timestamps
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_recent_searches_user_id ON recent_searches(user_id);
CREATE INDEX idx_recent_searches_searched_at ON recent_searches(user_id, searched_at DESC);
```

### group_dinner_sessions

Group dinner matching sessions.

```sql
CREATE TABLE group_dinner_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Participants
  participant_ids BIGINT[] NOT NULL,

  -- Preferences
  date DATE,
  time_slot VARCHAR(20), -- breakfast/lunch/dinner
  dietary_restrictions TEXT[],

  -- Selected restaurant
  selected_restaurant_id BIGINT REFERENCES restaurants(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_gds_creator_id ON group_dinner_sessions(creator_id);
CREATE INDEX idx_gds_created_at ON group_dinner_sessions(created_at DESC);
```

### group_dinner_votes

Votes during group dinner swipe session.

```sql
CREATE TABLE group_dinner_votes (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES group_dinner_sessions(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  vote VARCHAR(10) NOT NULL, -- yes/no/skip
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(session_id, user_id, restaurant_id)
);

CREATE INDEX idx_gdv_session_id ON group_dinner_votes(session_id);
CREATE INDEX idx_gdv_user_id ON group_dinner_votes(user_id);
```

---

## 12. Indexes

### Additional Performance Indexes

```sql
-- Full-text search on restaurant names
CREATE INDEX idx_restaurants_name_trgm ON restaurants USING gin(name gin_trgm_ops);

-- Geographic queries
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE INDEX idx_restaurants_location_gist ON restaurants USING gist(ST_MakePoint(longitude, latitude));

-- Composite indexes for common queries
CREATE INDEX idx_urr_user_status_created ON user_restaurant_relations(user_id, status, created_at DESC);
CREATE INDEX idx_activity_feed_user_created ON activity_feed(user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_follows_composite ON follows(follower_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at DESC) WHERE is_read = FALSE;

-- Partial indexes for soft deletes
CREATE INDEX idx_restaurants_active ON restaurants(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_reviews_active ON reviews(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_lists_active ON lists(id) WHERE deleted_at IS NULL;
```

---

## 13. Migrations

### Migration Strategy

**Tool**: Prisma Migrate or node-pg-migrate

**Process**:
1. Write migration SQL files
2. Test in local environment
3. Apply to staging database
4. Run automated tests
5. Apply to production with rollback plan

### Sample Migration: Create Users Table

```sql
-- migrations/001_create_users.up.sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  display_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- migrations/001_create_users.down.sql
DROP TABLE IF EXISTS users CASCADE;
```

### Seeding Strategy

**Development Seeds**:
- 50 test users
- 250 restaurants across NYC
- 1000+ user-restaurant relations
- 500+ reviews
- 13 tastemakers with posts

**Production Seeds**:
- Initial admin account
- Featured lists (curated by team)
- Restaurant data import (from Yelp/Google)

---

## Database Triggers

### Auto-update Timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (repeat for other tables)
```

### Update Denormalized Counts

```sql
-- Update followers_count when follow is added/removed
CREATE OR REPLACE FUNCTION update_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
    UPDATE users SET following_count = following_count - 1 WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_followers_count_trigger
AFTER INSERT OR DELETE ON follows
FOR EACH ROW EXECUTE FUNCTION update_followers_count();
```

---

## Backup & Recovery

### Backup Strategy

**Frequency**:
- Full backup: Daily at 2 AM UTC
- Incremental backup: Every 6 hours
- WAL archiving: Continuous

**Retention**:
- Daily backups: 30 days
- Weekly backups: 3 months
- Monthly backups: 1 year

**Tools**:
- AWS RDS automated backups
- pg_dump for logical backups
- Point-in-time recovery (PITR) enabled

### Recovery Plan

1. Identify issue and last good backup
2. Restore from backup to staging
3. Verify data integrity
4. Switch DNS to staging (if needed)
5. Promote staging to production

**RTO**: 1 hour
**RPO**: 15 minutes (with WAL archiving)

---

## Performance Optimization

### Query Optimization Checklist

- [ ] All foreign keys have indexes
- [ ] Frequently queried columns have indexes
- [ ] Full-text search uses GIN indexes
- [ ] Geographic queries use PostGIS GIST indexes
- [ ] Soft-deleted records use partial indexes
- [ ] Denormalized counts for expensive aggregations
- [ ] Read-heavy queries routed to read replicas
- [ ] Connection pooling configured (50-100 connections)
- [ ] EXPLAIN ANALYZE used for slow queries
- [ ] Query timeouts set (10 seconds)

---

## Next Steps

1. Review [backend-architecture.md](./backend-architecture.md) for system design context
2. Study [backend-api-spec.md](./backend-api-spec.md) for API endpoints
3. Read [backend-business-logic.md](./backend-business-logic.md) for algorithm implementations
4. Follow [backend-integration-guide.md](./backend-integration-guide.md) for migration plan
5. Set up PostgreSQL locally and run migrations
6. Seed development database with test data
7. Write integration tests for critical queries
