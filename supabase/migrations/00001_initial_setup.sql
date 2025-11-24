-- Initial Database Setup
-- Enables required PostgreSQL extensions

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for geospatial queries (nearby restaurants)
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enable pg_trgm for fuzzy text search (restaurant name search)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create ENUM types for app-wide constants

CREATE TYPE list_category AS ENUM (
  'restaurants',
  'bars',
  'bakeries',
  'coffee_tea',
  'dessert',
  'other'
);

CREATE TYPE list_scope AS ENUM (
  'been',
  'want_to_try',
  'recs',
  'playlists'
);

CREATE TYPE user_restaurant_status AS ENUM (
  'been',
  'want_to_try',
  'recommended'
);

CREATE TYPE feed_item_type AS ENUM (
  'visit',
  'review',
  'recommendation',
  'follow',
  'want_to_try',
  'bookmark'
);

CREATE TYPE notification_type AS ENUM (
  'rating_liked',
  'bookmark_liked',
  'comment',
  'follow',
  'list_bookmark',
  'streak',
  'recommendation'
);

CREATE TYPE reservation_status AS ENUM (
  'available',
  'claimed',
  'shared',
  'cancelled'
);

CREATE TYPE priority_level AS ENUM (
  'SC',
  'Gold',
  'Silver',
  'Bronze'
);

CREATE TYPE menu_item_category AS ENUM (
  'appetizer',
  'entree',
  'side',
  'dessert',
  'drink'
);

CREATE TYPE portion_size AS ENUM (
  'small',
  'medium',
  'large',
  'shareable'
);

CREATE TYPE tastemaker_badge_type AS ENUM (
  'verified',
  'pizza_expert',
  'michelin_hunter',
  'budget_guru',
  'vegan_queen',
  'fine_dining_specialist',
  'street_food_explorer',
  'brunch_master',
  'dessert_connoisseur',
  'ramen_specialist',
  'wine_expert'
);

COMMENT ON EXTENSION "uuid-ossp" IS 'Generate UUIDs for primary keys';
COMMENT ON EXTENSION "postgis" IS 'PostGIS for geospatial queries (nearby restaurants)';
COMMENT ON EXTENSION "pg_trgm" IS 'Trigram matching for fuzzy text search';
