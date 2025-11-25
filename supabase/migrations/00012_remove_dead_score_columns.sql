-- Migration: Remove Unused Score Columns
--
-- Problem: 6 denormalized score columns exist but are never populated:
--   - rec_score, rec_score_sample_size
--   - friend_score, friend_score_sample_size
--   - average_score, average_score_sample_size
--
-- These columns were intended for Beli's triple-score system but:
--   1. No triggers exist to update them
--   2. They contain only default/null values
--   3. They create maintenance confusion
--
-- Solution: Remove them. The single 'rating' column remains for overall score.
-- If triple-score is needed later, add it back with proper trigger logic.

-- ============================================
-- STEP 1: Remove the 6 unused score columns
-- ============================================

ALTER TABLE public.restaurants
  DROP COLUMN IF EXISTS rec_score,
  DROP COLUMN IF EXISTS rec_score_sample_size,
  DROP COLUMN IF EXISTS friend_score,
  DROP COLUMN IF EXISTS friend_score_sample_size,
  DROP COLUMN IF EXISTS average_score,
  DROP COLUMN IF EXISTS average_score_sample_size;

-- ============================================
-- STEP 2: Update comments to reflect simplified schema
-- ============================================

COMMENT ON TABLE public.restaurants IS 'Core restaurant data. Uses single rating column (0-10). Triple-score system removed for MVP simplicity.';
COMMENT ON COLUMN public.restaurants.rating IS 'Overall rating (0.0-10.0). Single source of truth for restaurant score.';
COMMENT ON COLUMN public.restaurants.rating_count IS 'Number of ratings this restaurant has received.';

-- ============================================
-- Summary
-- ============================================
-- Removed columns:
--   - rec_score (was for critic/tastemaker scores)
--   - rec_score_sample_size
--   - friend_score (was for friend average)
--   - friend_score_sample_size
--   - average_score (was for overall user average)
--   - average_score_sample_size
--
-- Kept columns:
--   - rating (overall score, 0-10)
--   - rating_count (number of ratings)
--
-- If triple-score is needed in future:
--   1. Add columns back with proper constraints
--   2. Create trigger to compute friend_score from ratings + user_follows
--   3. Create trigger to compute average_score from all ratings
--   4. rec_score can be computed from tastemaker ratings
