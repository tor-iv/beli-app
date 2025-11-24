-- PostgreSQL Functions
-- Custom database functions for complex queries

-- ========== Nearby Restaurants Function ==========
-- Find restaurants within a radius (geospatial query)

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
    -- Calculate distance in miles
    (ST_Distance(
      r.coordinates,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) * 0.000621371)::FLOAT AS distance_miles
  FROM public.restaurants r
  WHERE
    -- Within radius (convert miles to meters)
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
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.nearby_restaurants IS 'Find restaurants within radius (PostGIS geospatial query)';


-- ========== Search Restaurants Function ==========
-- Advanced restaurant search with multiple filters

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
    -- Text search (fuzzy matching on name, cuisine, tags, dishes)
    (
      search_query = ''
      OR r.name ILIKE '%' || search_query || '%'
      OR r.cuisine::text ILIKE '%' || search_query || '%'
      OR r.tags::text ILIKE '%' || search_query || '%'
      OR r.popular_dishes::text ILIKE '%' || search_query || '%'
      OR r.neighborhood ILIKE '%' || search_query || '%'
    )
    -- Cuisine filter (array overlap)
    AND (filter_cuisine IS NULL OR r.cuisine ?| filter_cuisine)
    -- Price range filter
    AND (filter_price IS NULL OR r.price_range = ANY(filter_price))
    -- City filter
    AND (filter_city IS NULL OR r.city = filter_city)
    -- Neighborhood filter
    AND (filter_neighborhood IS NULL OR r.neighborhood = filter_neighborhood)
    -- Category filter
    AND (filter_category IS NULL OR r.category = filter_category)
    -- Rating filter
    AND r.rating >= min_rating
  ORDER BY r.rating DESC, r.rating_count DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.search_restaurants IS 'Advanced restaurant search with multiple filters';


-- ========== Trending Restaurants Function ==========
-- Get trending restaurants based on recent activity

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
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.trending_restaurants IS 'Get trending restaurants based on recent activity';


-- ========== User Feed Function ==========
-- Generate personalized activity feed for a user

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
  -- Joined data
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
    -- Own feed items
    f.user_id = for_user_id
    OR
    -- Feed items from people user follows
    f.user_id IN (
      SELECT following_id
      FROM public.user_follows
      WHERE follower_id = for_user_id
    )
  ORDER BY f.created_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.user_feed IS 'Generate personalized activity feed for a user';


-- ========== User Match Percentage Function ==========
-- Calculate taste compatibility between two users

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
  -- Get restaurants user1 has been to or wants to try
  SELECT ARRAY_AGG(DISTINCT restaurant_id)
  INTO user1_restaurants
  FROM public.user_restaurant_relations
  WHERE user_id = user1_id
    AND status IN ('been', 'want_to_try');

  -- Get restaurants user2 has been to or wants to try
  SELECT ARRAY_AGG(DISTINCT restaurant_id)
  INTO user2_restaurants
  FROM public.user_restaurant_relations
  WHERE user_id = user2_id
    AND status IN ('been', 'want_to_try');

  -- Handle null cases
  IF user1_restaurants IS NULL OR user2_restaurants IS NULL THEN
    RETURN 30; -- Baseline match percentage
  END IF;

  -- Calculate Jaccard similarity (intersection / union)
  SELECT COUNT(*)
  INTO intersection_count
  FROM UNNEST(user1_restaurants) AS r1
  WHERE r1 = ANY(user2_restaurants);

  SELECT COUNT(DISTINCT r)
  INTO union_count
  FROM UNNEST(user1_restaurants || user2_restaurants) AS r;

  -- Calculate percentage (with floor of 30, ceiling of 99)
  IF union_count = 0 THEN
    match_percentage := 30;
  ELSE
    match_percentage := GREATEST(30, LEAST(99, ROUND((intersection_count::FLOAT / union_count) * 100)));
  END IF;

  RETURN match_percentage;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.user_match_percentage IS 'Calculate taste compatibility between users (Jaccard similarity)';


-- ========== Leaderboard Function ==========
-- Get user leaderboard by various metrics

CREATE OR REPLACE FUNCTION public.leaderboard(
  metric TEXT DEFAULT 'beenCount', -- beenCount, wantToTryCount, totalReviews, followers, currentStreak
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
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.leaderboard IS 'Get user leaderboard by metric (beenCount, reviews, followers, etc.)';


-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.nearby_restaurants TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_restaurants TO authenticated;
GRANT EXECUTE ON FUNCTION public.trending_restaurants TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_feed TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_match_percentage TO authenticated;
GRANT EXECUTE ON FUNCTION public.leaderboard TO authenticated;

-- Also grant to anon for public queries (restaurants)
GRANT EXECUTE ON FUNCTION public.nearby_restaurants TO anon;
GRANT EXECUTE ON FUNCTION public.search_restaurants TO anon;
GRANT EXECUTE ON FUNCTION public.trending_restaurants TO anon;
