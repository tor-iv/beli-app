-- Migration: Simplify Schema for MVP
--
-- This migration:
-- 1. Drops unused tables (feed_items, notifications, etc.)
-- 2. Renames user_restaurant_relations → ratings
-- 3. Simplifies users table (stats computed on read)
--
-- PostgreSQL remains source of truth. Feed is derived via query, not stored.

-- ============================================
-- STEP 1: Drop triggers that depend on tables we're dropping
-- ============================================

-- Drop triggers on feed_items
DROP TRIGGER IF EXISTS update_feed_items_updated_at ON public.feed_items;

-- Drop triggers on feed_comments
DROP TRIGGER IF EXISTS update_feed_comments_updated_at ON public.feed_comments;

-- Drop triggers on tastemaker_posts
DROP TRIGGER IF EXISTS update_tastemaker_posts_updated_at ON public.tastemaker_posts;

-- Drop triggers on reservations
DROP TRIGGER IF EXISTS update_reservations_updated_at ON public.reservations;

-- Drop triggers on lists
DROP TRIGGER IF EXISTS update_lists_updated_at ON public.lists;

-- Drop triggers on reviews (merging into ratings.notes)
DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
DROP TRIGGER IF EXISTS update_restaurant_ratings_trigger ON public.reviews;

-- ============================================
-- STEP 2: Drop RLS policies on tables we're dropping
-- ============================================

-- Feed items policies
DROP POLICY IF EXISTS "Users can view public feed items" ON public.feed_items;
DROP POLICY IF EXISTS "Users can view feed items from followed users" ON public.feed_items;
DROP POLICY IF EXISTS "Users can create their own feed items" ON public.feed_items;
DROP POLICY IF EXISTS "Users can update their own feed items" ON public.feed_items;
DROP POLICY IF EXISTS "Users can delete their own feed items" ON public.feed_items;

-- Feed comments policies
DROP POLICY IF EXISTS "Users can view comments on visible feed items" ON public.feed_comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.feed_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.feed_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.feed_comments;

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

-- Lists policies
DROP POLICY IF EXISTS "Users can view public lists" ON public.lists;
DROP POLICY IF EXISTS "Users can view their own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can create their own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can update their own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can delete their own lists" ON public.lists;

-- Reviews policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

-- Tastemaker posts policies
DROP POLICY IF EXISTS "Anyone can view published tastemaker posts" ON public.tastemaker_posts;
DROP POLICY IF EXISTS "Tastemakers can create posts" ON public.tastemaker_posts;
DROP POLICY IF EXISTS "Tastemakers can update their own posts" ON public.tastemaker_posts;
DROP POLICY IF EXISTS "Tastemakers can delete their own posts" ON public.tastemaker_posts;

-- Reservations policies
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can view reservations shared with them" ON public.reservations;
DROP POLICY IF EXISTS "Users can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can delete their own reservations" ON public.reservations;

-- Group dinner policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.group_dinner_sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON public.group_dinner_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.group_dinner_sessions;

-- Search history policies
DROP POLICY IF EXISTS "Users can view their own search history" ON public.search_history;
DROP POLICY IF EXISTS "Users can create search history" ON public.search_history;

-- Challenge goals policies
DROP POLICY IF EXISTS "Users can view their own goals" ON public.challenge_goals;
DROP POLICY IF EXISTS "Users can create their own goals" ON public.challenge_goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.challenge_goals;

-- ============================================
-- STEP 3: Drop dependent functions
-- ============================================

DROP FUNCTION IF EXISTS public.update_restaurant_ratings() CASCADE;

-- ============================================
-- STEP 4: Drop unused tables (in dependency order)
-- ============================================

-- Tables with foreign keys to feed_items
DROP TABLE IF EXISTS public.feed_comments CASCADE;

-- Tables with foreign keys to other tables
DROP TABLE IF EXISTS public.notifications CASCADE;

-- Independent tables
DROP TABLE IF EXISTS public.feed_items CASCADE;
DROP TABLE IF EXISTS public.lists CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.tastemaker_posts CASCADE;
DROP TABLE IF EXISTS public.reservations CASCADE;
DROP TABLE IF EXISTS public.group_dinner_sessions CASCADE;
DROP TABLE IF EXISTS public.search_history CASCADE;
DROP TABLE IF EXISTS public.challenge_goals CASCADE;

-- ============================================
-- STEP 5: Rename user_restaurant_relations → ratings
-- ============================================

-- Drop existing triggers on user_restaurant_relations
DROP TRIGGER IF EXISTS update_urr_updated_at ON public.user_restaurant_relations;
DROP TRIGGER IF EXISTS update_user_restaurant_stats_trigger ON public.user_restaurant_relations;

-- Drop existing policies on user_restaurant_relations
DROP POLICY IF EXISTS "Users can view all relations" ON public.user_restaurant_relations;
DROP POLICY IF EXISTS "Users can create their own relations" ON public.user_restaurant_relations;
DROP POLICY IF EXISTS "Users can update their own relations" ON public.user_restaurant_relations;
DROP POLICY IF EXISTS "Users can delete their own relations" ON public.user_restaurant_relations;

-- Rename table
ALTER TABLE public.user_restaurant_relations RENAME TO ratings;

-- Rename indexes (PostgreSQL auto-renames constraints but not indexes)
ALTER INDEX IF EXISTS idx_urr_user RENAME TO idx_ratings_user;
ALTER INDEX IF EXISTS idx_urr_restaurant RENAME TO idx_ratings_restaurant;
ALTER INDEX IF EXISTS idx_urr_status RENAME TO idx_ratings_status;
ALTER INDEX IF EXISTS idx_urr_user_status RENAME TO idx_ratings_user_status;
ALTER INDEX IF EXISTS idx_urr_created_at RENAME TO idx_ratings_created_at;
ALTER INDEX IF EXISTS idx_urr_visit_date RENAME TO idx_ratings_visit_date;

-- Rename constraint
ALTER TABLE public.ratings RENAME CONSTRAINT user_restaurant_relations_pkey TO ratings_pkey;

-- Add updated_at trigger back
CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Re-enable RLS with new policies
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings"
  ON public.ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own ratings"
  ON public.ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON public.ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON public.ratings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 6: Simplify users table (remove stats JSONB dependency)
-- ============================================

-- Stats will be computed on-read via a view or function instead of storing

-- ============================================
-- STEP 7: Create feed query function
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar TEXT,
  restaurant_id UUID,
  restaurant_name TEXT,
  restaurant_cuisine JSONB,
  restaurant_neighborhood TEXT,
  status user_restaurant_status,
  score NUMERIC(3,1),
  notes TEXT,
  visit_date DATE,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.user_id,
    u.username,
    u.display_name,
    u.avatar,
    r.restaurant_id,
    rest.name as restaurant_name,
    rest.cuisine as restaurant_cuisine,
    rest.neighborhood as restaurant_neighborhood,
    r.status,
    r.rating as score,
    r.notes,
    r.visit_date,
    r.created_at
  FROM public.ratings r
  JOIN public.users u ON r.user_id = u.id
  JOIN public.restaurants rest ON r.restaurant_id = rest.id
  WHERE r.user_id IN (
    -- Get activity from users we follow
    SELECT following_id FROM public.user_follows WHERE follower_id = p_user_id
    UNION
    -- Include own activity
    SELECT p_user_id
  )
  ORDER BY r.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.get_user_feed IS 'Get activity feed for a user (their activity + followed users)';

-- Grant access
GRANT EXECUTE ON FUNCTION public.get_user_feed TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_feed TO anon;

-- ============================================
-- STEP 8: Create user stats view (computed, not stored)
-- ============================================

CREATE OR REPLACE VIEW public.user_stats AS
SELECT
  u.id as user_id,
  u.username,
  u.display_name,
  (SELECT COUNT(*) FROM public.user_follows WHERE following_id = u.id) as followers_count,
  (SELECT COUNT(*) FROM public.user_follows WHERE follower_id = u.id) as following_count,
  (SELECT COUNT(*) FROM public.ratings WHERE user_id = u.id AND status = 'been') as been_count,
  (SELECT COUNT(*) FROM public.ratings WHERE user_id = u.id AND status = 'want_to_try') as want_to_try_count,
  (SELECT COUNT(*) FROM public.ratings WHERE user_id = u.id AND status = 'recommended') as recommended_count
FROM public.users u;

COMMENT ON VIEW public.user_stats IS 'User statistics computed from ratings and follows';

-- ============================================
-- Summary of changes
-- ============================================

COMMENT ON TABLE public.ratings IS 'User-restaurant relationships (been/want-to-try/recommended). Renamed from user_restaurant_relations.';

-- Done!
