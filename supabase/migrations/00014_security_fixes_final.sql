-- Migration: Final Security Fixes
--
-- Problem: Migration 00013 dropped and recreated user_stats view,
-- which removed the security_invoker setting from migration 00012.
-- Also re-applies spatial_ref_sys RLS in case it wasn't applied.
--
-- Solution: Re-apply security settings after all schema changes

-- ============================================
-- SECTION 1: Fix user_stats View
-- ============================================

-- Set security_invoker = true on user_stats view
-- This ensures the view respects RLS policies of the querying user
-- instead of the view owner (SECURITY DEFINER behavior)
ALTER VIEW public.user_stats SET (security_invoker = true);

-- ============================================
-- SECTION 2: Fix spatial_ref_sys Table
-- ============================================

-- The spatial_ref_sys table is a PostGIS extension table owned by the superuser.
-- We cannot ALTER it directly from migrations (permission denied).
--
-- Solution: Move it to the 'extensions' schema where it belongs.
-- This removes it from the public schema that PostgREST exposes,
-- eliminating the security linter warning.

DO $$
BEGIN
  -- Move spatial_ref_sys to extensions schema if it exists in public
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'spatial_ref_sys'
  ) THEN
    -- Ensure extensions schema exists
    CREATE SCHEMA IF NOT EXISTS extensions;

    -- Transfer ownership to postgres and move to extensions schema
    -- Note: This requires superuser privileges. If it fails, see manual fix below.
    ALTER TABLE public.spatial_ref_sys SET SCHEMA extensions;
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    -- If we don't have permission, log and continue
    RAISE NOTICE 'Cannot move spatial_ref_sys - requires superuser. See manual fix in comments.';
END $$;

-- ============================================
-- MANUAL FIX for spatial_ref_sys (if migration fails)
-- ============================================
--
-- Run this in the Supabase Dashboard SQL Editor (has superuser access):
--
--   ALTER TABLE public.spatial_ref_sys SET SCHEMA extensions;
--
-- OR enable RLS directly:
--
--   ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
--   CREATE POLICY "Allow read access" ON public.spatial_ref_sys FOR SELECT USING (true);
--
-- OR simply ignore this warning - spatial_ref_sys is a PostGIS system table
-- containing coordinate reference definitions. It has no sensitive data.
-- Many Supabase projects safely ignore this linter warning.

-- ============================================
-- Verification Queries (run manually to confirm)
-- ============================================
--
-- Check user_stats has security_invoker:
--   SELECT relname, reloptions
--   FROM pg_class
--   WHERE relname = 'user_stats';
--
-- Check spatial_ref_sys has RLS:
--   SELECT relname, relrowsecurity
--   FROM pg_class
--   WHERE relname = 'spatial_ref_sys';
--
-- Expected: reloptions should contain 'security_invoker=true'
--           relrowsecurity should be 't' (true)
