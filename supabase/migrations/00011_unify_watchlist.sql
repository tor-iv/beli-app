-- Migration: Unify Watchlist Storage
--
-- Problem: Want-to-try data was stored in TWO places:
--   1. users.watchlist TEXT[] array (migration 00010)
--   2. ratings table with status='want_to_try' (migration 00004/00009)
--
-- Solution: Keep only users.watchlist array, fix user_stats view
--
-- This eliminates dual storage and ensures single source of truth.

-- ============================================
-- STEP 1: Drop and recreate user_stats view to use watchlist array
-- ============================================

-- Must DROP first because column type changes (bigint -> integer)
DROP VIEW IF EXISTS public.user_stats;

-- The view was querying ratings.status='want_to_try' but watchlist is now on users table
CREATE VIEW public.user_stats AS
SELECT
  u.id as user_id,
  u.username,
  u.display_name,
  (SELECT COUNT(*) FROM public.user_follows WHERE following_id = u.id) as followers_count,
  (SELECT COUNT(*) FROM public.user_follows WHERE follower_id = u.id) as following_count,
  (SELECT COUNT(*) FROM public.ratings WHERE user_id = u.id AND status = 'been') as been_count,
  -- CHANGED: Now uses watchlist array length instead of ratings table
  COALESCE(array_length(u.watchlist, 1), 0) as want_to_try_count,
  (SELECT COUNT(*) FROM public.ratings WHERE user_id = u.id AND status = 'recommended') as recommended_count
FROM public.users u;

COMMENT ON VIEW public.user_stats IS 'User statistics computed from ratings, follows, and watchlist. Want-to-try count now uses users.watchlist array.';

-- ============================================
-- STEP 2: Migrate any orphaned want_to_try ratings to watchlist
-- ============================================

-- First, ensure any want_to_try entries in ratings are also in watchlist
-- This is idempotent - won't create duplicates due to array_append behavior
UPDATE public.users u
SET watchlist = (
  SELECT COALESCE(
    array_agg(DISTINCT val),
    '{}'::TEXT[]
  )
  FROM (
    -- Existing watchlist items
    SELECT unnest(u.watchlist) as val
    UNION
    -- Plus any want_to_try from ratings table
    SELECT r.restaurant_id::TEXT as val
    FROM public.ratings r
    WHERE r.user_id = u.id AND r.status = 'want_to_try'
  ) combined
)
WHERE EXISTS (
  SELECT 1 FROM public.ratings r
  WHERE r.user_id = u.id AND r.status = 'want_to_try'
);

-- ============================================
-- STEP 3: Remove want_to_try entries from ratings table
-- ============================================

-- Now safe to remove - data has been migrated to watchlist
DELETE FROM public.ratings WHERE status = 'want_to_try';

-- ============================================
-- STEP 4: Add comment documenting the storage pattern
-- ============================================

COMMENT ON COLUMN public.users.watchlist IS 'Array of restaurant IDs user wants to try. THIS IS THE SINGLE SOURCE OF TRUTH for want-to-try list. Do NOT use ratings table with status=want_to_try.';

-- ============================================
-- Summary
-- ============================================
-- - Updated user_stats view to count watchlist array instead of ratings
-- - Migrated any orphaned want_to_try ratings to watchlist
-- - Removed want_to_try entries from ratings table
-- - Documented the storage pattern to prevent future confusion
