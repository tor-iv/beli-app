-- Migration: Security Fixes
--
-- This migration addresses Supabase security linter warnings:
-- 1. Functions with mutable search_path (vulnerable to search_path injection)
-- 2. View with SECURITY DEFINER (bypasses RLS of querying user)
-- 3. PostGIS spatial_ref_sys table without RLS
--
-- Fix: Add SET search_path = '' to all functions, set security_invoker on view,
--      and enable RLS on spatial_ref_sys

-- ============================================
-- SECTION 1: Fix Functions from 00008_functions.sql
-- ============================================

-- Fix nearby_restaurants
CREATE OR REPLACE FUNCTION public.nearby_restaurants(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_miles FLOAT DEFAULT 2.0,
  min_rating FLOAT DEFAULT 0.0,
  result_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  cuisine JSONB,
  category list_category,
  price_range TEXT,
  address TEXT,
  city TEXT,
  neighborhood TEXT,
  latitude FLOAT,
  longitude FLOAT,
  rating NUMERIC,
  rating_count INTEGER,
  images JSONB,
  is_open BOOLEAN,
  distance_miles FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.name,
    r.cuisine,
    r.category,
    r.price_range,
    r.address,
    r.city,
    r.neighborhood,
    ST_Y(r.coordinates::geometry) AS latitude,
    ST_X(r.coordinates::geometry) AS longitude,
    r.rating,
    r.rating_count,
    r.images,
    r.is_open,
    (ST_Distance(
      r.coordinates,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) * 0.000621371)::FLOAT AS distance_miles
  FROM public.restaurants r
  WHERE
    ST_DWithin(
      r.coordinates,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_miles * 1609.34
    )
    AND r.rating >= min_rating
    AND r.is_open = true
  ORDER BY distance_miles ASC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE
SET search_path = '';

-- Fix search_restaurants
CREATE OR REPLACE FUNCTION public.search_restaurants(
  search_query TEXT DEFAULT '',
  filter_cuisine TEXT[] DEFAULT NULL,
  filter_price TEXT[] DEFAULT NULL,
  filter_city TEXT DEFAULT NULL,
  filter_neighborhood TEXT DEFAULT NULL,
  filter_category list_category DEFAULT NULL,
  min_rating FLOAT DEFAULT 0.0,
  result_limit INTEGER DEFAULT 20,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  cuisine JSONB,
  category list_category,
  price_range TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  neighborhood TEXT,
  latitude FLOAT,
  longitude FLOAT,
  rating NUMERIC,
  rating_count INTEGER,
  rec_score NUMERIC,
  friend_score NUMERIC,
  images JSONB,
  tags JSONB,
  popular_dishes JSONB,
  is_open BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.name,
    r.cuisine,
    r.category,
    r.price_range,
    r.address,
    r.city,
    r.state,
    r.neighborhood,
    ST_Y(r.coordinates::geometry) AS latitude,
    ST_X(r.coordinates::geometry) AS longitude,
    r.rating,
    r.rating_count,
    r.rec_score,
    r.friend_score,
    r.images,
    r.tags,
    r.popular_dishes,
    r.is_open
  FROM public.restaurants r
  WHERE
    (
      search_query = ''
      OR r.name ILIKE '%' || search_query || '%'
      OR r.cuisine::text ILIKE '%' || search_query || '%'
      OR r.tags::text ILIKE '%' || search_query || '%'
      OR r.popular_dishes::text ILIKE '%' || search_query || '%'
      OR r.neighborhood ILIKE '%' || search_query || '%'
    )
    AND (filter_cuisine IS NULL OR r.cuisine ?| filter_cuisine)
    AND (filter_price IS NULL OR r.price_range = ANY(filter_price))
    AND (filter_city IS NULL OR r.city = filter_city)
    AND (filter_neighborhood IS NULL OR r.neighborhood = filter_neighborhood)
    AND (filter_category IS NULL OR r.category = filter_category)
    AND r.rating >= min_rating
  ORDER BY r.rating DESC, r.rating_count DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql STABLE
SET search_path = '';

-- Fix trending_restaurants
CREATE OR REPLACE FUNCTION public.trending_restaurants(
  result_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  cuisine JSONB,
  category list_category,
  price_range TEXT,
  neighborhood TEXT,
  city TEXT,
  rating NUMERIC,
  rating_count INTEGER,
  images JSONB,
  recent_activity_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.name,
    r.cuisine,
    r.category,
    r.price_range,
    r.neighborhood,
    r.city,
    r.rating,
    r.rating_count,
    r.images,
    COUNT(f.id) AS recent_activity_count
  FROM public.restaurants r
  LEFT JOIN public.feed_items f ON f.restaurant_id = r.id
    AND f.created_at > NOW() - INTERVAL '7 days'
  WHERE r.rating >= 7.5
    AND r.is_open = true
  GROUP BY r.id
  ORDER BY recent_activity_count DESC, r.rating DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE
SET search_path = '';

-- Fix user_feed (has SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.user_feed(
  for_user_id UUID,
  result_limit INTEGER DEFAULT 20,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  restaurant_id UUID,
  type feed_item_type,
  rating NUMERIC,
  comment TEXT,
  photos TEXT[],
  tags TEXT[],
  companions UUID[],
  likes UUID[],
  bookmarks UUID[],
  created_at TIMESTAMPTZ,
  username TEXT,
  display_name TEXT,
  user_avatar TEXT,
  restaurant_name TEXT,
  restaurant_images JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.user_id,
    f.restaurant_id,
    f.type,
    f.rating,
    f.comment,
    f.photos,
    f.tags,
    f.companions,
    f.likes,
    f.bookmarks,
    f.created_at,
    u.username,
    u.display_name,
    u.avatar AS user_avatar,
    r.name AS restaurant_name,
    r.images AS restaurant_images
  FROM public.feed_items f
  JOIN public.users u ON u.id = f.user_id
  LEFT JOIN public.restaurants r ON r.id = f.restaurant_id
  WHERE
    f.user_id = for_user_id
    OR
    f.user_id IN (
      SELECT following_id
      FROM public.user_follows
      WHERE follower_id = for_user_id
    )
  ORDER BY f.created_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = '';

-- Fix user_match_percentage
CREATE OR REPLACE FUNCTION public.user_match_percentage(
  user1_id UUID,
  user2_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  user1_restaurants UUID[];
  user2_restaurants UUID[];
  intersection_count INTEGER;
  union_count INTEGER;
  match_percentage INTEGER;
BEGIN
  SELECT ARRAY_AGG(DISTINCT restaurant_id)
  INTO user1_restaurants
  FROM public.user_restaurant_relations
  WHERE user_id = user1_id
    AND status IN ('been', 'want_to_try');

  SELECT ARRAY_AGG(DISTINCT restaurant_id)
  INTO user2_restaurants
  FROM public.user_restaurant_relations
  WHERE user_id = user2_id
    AND status IN ('been', 'want_to_try');

  IF user1_restaurants IS NULL OR user2_restaurants IS NULL THEN
    RETURN 30;
  END IF;

  SELECT COUNT(*)
  INTO intersection_count
  FROM UNNEST(user1_restaurants) AS r1
  WHERE r1 = ANY(user2_restaurants);

  SELECT COUNT(DISTINCT r)
  INTO union_count
  FROM UNNEST(user1_restaurants || user2_restaurants) AS r;

  IF union_count = 0 THEN
    match_percentage := 30;
  ELSE
    match_percentage := GREATEST(30, LEAST(99, ROUND((intersection_count::FLOAT / union_count) * 100)));
  END IF;

  RETURN match_percentage;
END;
$$ LANGUAGE plpgsql STABLE
SET search_path = '';

-- Fix leaderboard
CREATE OR REPLACE FUNCTION public.leaderboard(
  metric TEXT DEFAULT 'beenCount',
  result_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  avatar TEXT,
  rank INTEGER,
  metric_value INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.username,
    u.display_name,
    u.avatar,
    ROW_NUMBER() OVER (ORDER BY (u.stats->>metric)::INTEGER DESC)::INTEGER AS rank,
    (u.stats->>metric)::INTEGER AS metric_value
  FROM public.users u
  WHERE (u.stats->>metric)::INTEGER > 0
  ORDER BY metric_value DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE
SET search_path = '';

-- ============================================
-- SECTION 2: Fix Functions from 00010_add_watchlist_and_functions.sql
-- ============================================

-- Fix add_to_watchlist (has SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.add_to_watchlist(
  p_user_id UUID,
  p_restaurant_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  UPDATE public.users
  SET watchlist = array_append(watchlist, p_restaurant_id)
  WHERE id = p_user_id
    AND NOT (p_restaurant_id = ANY(watchlist));

  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = '';

-- Fix remove_from_watchlist (has SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.remove_from_watchlist(
  p_user_id UUID,
  p_restaurant_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  rows_affected INTEGER;
BEGIN
  UPDATE public.users
  SET watchlist = array_remove(watchlist, p_restaurant_id)
  WHERE id = p_user_id;

  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = '';

-- Fix is_in_watchlist
CREATE OR REPLACE FUNCTION public.is_in_watchlist(
  p_user_id UUID,
  p_restaurant_id TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = p_user_id
      AND p_restaurant_id = ANY(watchlist)
  );
END;
$$ LANGUAGE plpgsql STABLE
SET search_path = '';

-- Fix get_friend_recommendations
CREATE OR REPLACE FUNCTION public.get_friend_recommendations(
  p_user_id UUID,
  p_min_rating NUMERIC DEFAULT 8.0,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  cuisine TEXT[],
  category TEXT,
  price_range TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  neighborhood TEXT,
  rating NUMERIC,
  rating_count INTEGER,
  images TEXT[],
  is_open BOOLEAN,
  accepts_reservations BOOLEAN,
  friend_rating NUMERIC,
  recommender_name TEXT,
  recommender_username TEXT,
  recommender_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH friend_ratings AS (
    SELECT
      r.restaurant_id::TEXT as rest_id,
      rt.rating as friend_score,
      u.display_name as friend_name,
      u.username as friend_username,
      COUNT(*) OVER (PARTITION BY r.id) as friend_count
    FROM public.restaurants r
    JOIN public.ratings rt ON r.id = rt.restaurant_id
    JOIN public.user_follows uf ON rt.user_id = uf.following_id
    JOIN public.users u ON rt.user_id = u.id
    WHERE uf.follower_id = p_user_id
      AND rt.rating >= p_min_rating
      AND rt.status = 'been'
  ),
  already_visited AS (
    SELECT restaurant_id::TEXT as rest_id
    FROM public.ratings
    WHERE user_id = p_user_id
  )
  SELECT DISTINCT ON (r.id)
    r.id::TEXT,
    r.name,
    r.cuisine,
    r.category::TEXT,
    r.price_range::TEXT,
    r.address,
    r.city,
    r.state,
    r.neighborhood,
    r.rating,
    r.rating_count,
    r.images,
    r.is_open,
    r.accepts_reservations,
    fr.friend_score,
    fr.friend_name,
    fr.friend_username,
    fr.friend_count::INTEGER
  FROM public.restaurants r
  JOIN friend_ratings fr ON r.id::TEXT = fr.rest_id
  WHERE r.id::TEXT NOT IN (SELECT rest_id FROM already_visited)
    AND r.id::TEXT NOT IN (
      SELECT unnest(watchlist) FROM public.users WHERE id = p_user_id
    )
  ORDER BY r.id, fr.friend_score DESC, fr.friend_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE
SET search_path = '';

-- Fix get_user_cuisine_preferences
CREATE OR REPLACE FUNCTION public.get_user_cuisine_preferences(
  p_user_id UUID,
  p_min_visits INTEGER DEFAULT 1
)
RETURNS TABLE (
  cuisine TEXT,
  visit_count BIGINT,
  avg_rating NUMERIC,
  max_rating NUMERIC,
  min_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    unnest(rest.cuisine) as cuisine_type,
    COUNT(*)::BIGINT as visits,
    ROUND(AVG(rt.rating)::NUMERIC, 1) as average_rating,
    MAX(rt.rating) as highest_rating,
    MIN(rt.rating) as lowest_rating
  FROM public.ratings rt
  JOIN public.restaurants rest ON rt.restaurant_id = rest.id
  WHERE rt.user_id = p_user_id
    AND rt.status = 'been'
    AND rt.rating IS NOT NULL
  GROUP BY unnest(rest.cuisine)
  HAVING COUNT(*) >= p_min_visits
  ORDER BY average_rating DESC, visits DESC;
END;
$$ LANGUAGE plpgsql STABLE
SET search_path = '';

-- ============================================
-- SECTION 3: Fix user_stats View
-- ============================================

-- Change view from SECURITY DEFINER to SECURITY INVOKER
-- This ensures the view respects RLS policies of the querying user
ALTER VIEW public.user_stats SET (security_invoker = true);

-- ============================================
-- SECTION 4: Fix spatial_ref_sys RLS
-- ============================================

-- Enable RLS on PostGIS spatial_ref_sys table
-- This is a read-only reference table, so we allow public read access
ALTER TABLE IF EXISTS public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create permissive read policy (it's just coordinate reference data)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'spatial_ref_sys') THEN
    -- Drop existing policy if any
    DROP POLICY IF EXISTS "Allow public read access to spatial_ref_sys" ON public.spatial_ref_sys;
    -- Create new policy
    CREATE POLICY "Allow public read access to spatial_ref_sys"
      ON public.spatial_ref_sys
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- ============================================
-- Summary of Changes
-- ============================================
--
-- Functions updated with SET search_path = '':
--   - nearby_restaurants
--   - search_restaurants
--   - trending_restaurants
--   - user_feed (also has SECURITY DEFINER)
--   - user_match_percentage
--   - leaderboard
--   - add_to_watchlist (also has SECURITY DEFINER)
--   - remove_from_watchlist (also has SECURITY DEFINER)
--   - is_in_watchlist
--   - get_friend_recommendations
--   - get_user_cuisine_preferences
--
-- View updated:
--   - user_stats (changed to security_invoker = true)
--
-- Table updated:
--   - spatial_ref_sys (enabled RLS with permissive read policy)
