-- Migration: Add Watchlist and Recommendation Functions
--
-- This migration:
-- 1. Adds watchlist array column to users table
-- 2. Creates PostgreSQL functions for watchlist operations
-- 3. Creates function for computed friend recommendations
-- 4. Creates function for user cuisine preferences (taste profile)
--
-- Philosophy: Watchlist is simple (array of IDs), recommendations are computed on-the-fly

-- ============================================
-- STEP 1: Add watchlist column to users table
-- ============================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS watchlist TEXT[] DEFAULT '{}';

-- GIN index for efficient array lookups (contains, overlap queries)
CREATE INDEX IF NOT EXISTS idx_users_watchlist ON public.users USING GIN (watchlist);

COMMENT ON COLUMN public.users.watchlist IS 'Array of restaurant IDs the user wants to try';

-- ============================================
-- STEP 2: Watchlist manipulation functions
-- ============================================

-- Add restaurant to watchlist (idempotent - won't add duplicates)
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
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

COMMENT ON FUNCTION public.add_to_watchlist IS 'Add a restaurant to user watchlist (want-to-try list)';

-- Remove restaurant from watchlist
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
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

COMMENT ON FUNCTION public.remove_from_watchlist IS 'Remove a restaurant from user watchlist';

-- Check if restaurant is in watchlist
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
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.is_in_watchlist IS 'Check if a restaurant is in user watchlist';

-- ============================================
-- STEP 3: Friend recommendations function (computed)
-- ============================================

-- Get recommended restaurants based on friends' high ratings
-- This is computed on-the-fly, not stored
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
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.get_friend_recommendations IS 'Get restaurant recommendations based on friends high ratings (8.0+ by default)';

-- ============================================
-- STEP 4: User cuisine preferences function (taste profile)
-- ============================================

-- Get user's cuisine preferences based on their highly-rated visits
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
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.get_user_cuisine_preferences IS 'Get user cuisine preferences based on their restaurant visits and ratings';

-- ============================================
-- STEP 5: Grant permissions
-- ============================================

-- Grant execute on new functions
GRANT EXECUTE ON FUNCTION public.add_to_watchlist TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_to_watchlist TO anon;

GRANT EXECUTE ON FUNCTION public.remove_from_watchlist TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_from_watchlist TO anon;

GRANT EXECUTE ON FUNCTION public.is_in_watchlist TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_in_watchlist TO anon;

GRANT EXECUTE ON FUNCTION public.get_friend_recommendations TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_friend_recommendations TO anon;

GRANT EXECUTE ON FUNCTION public.get_user_cuisine_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_cuisine_preferences TO anon;

-- ============================================
-- Summary
-- ============================================
-- Added:
--   - users.watchlist column (TEXT[])
--   - add_to_watchlist() function
--   - remove_from_watchlist() function
--   - is_in_watchlist() function
--   - get_friend_recommendations() function (computed recs)
--   - get_user_cuisine_preferences() function (taste profile)
