-- Seed: Expanded Follows for Beli App
--
-- Creates ~60 follows to build a realistic social graph:
-- 1. Friend clusters (mutual follows within groups)
-- 2. Everyone follows popular tastemakers
-- 3. Demo user follows everyone (for testing feeds)
-- 4. Some asymmetric follows (one-way interest)
--
-- User IDs Reference (valid hex UUIDs):
-- Original 10 Users:
--   11111111... = demo_user (Demo User - YOU)
--   22222222... = foodie_sarah
--   33333333... = chef_mike (Tastemaker)
--   44444444... = nyc_explorer
--   55555555... = pizza_pete
--   66666666... = sushi_sarah (Tastemaker)
--   77777777... = brunch_queen
--   88888888... = late_night_leo
--   99999999... = healthy_hannah
--   aaaaaaaa... = foodtruck_fred (Tastemaker)
--
-- New 15 Users (hex 0b-19):
--   0000000b... = astoria_andy (Tastemaker)
--   0000000c... = chinatown_chen (Tastemaker)
--   0000000d... = williamsburg_will
--   0000000e... = thai_tina (Tastemaker)
--   0000000f... = indian_ian
--   00000010... = bbq_bobby (Tastemaker)
--   00000011... = latenight_lisa
--   00000012... = brunch_brad
--   00000013... = datenight_diana
--   00000014... = vegan_victor
--   00000015... = coffee_carla (Tastemaker)
--   00000016... = bagel_ben
--   00000017... = sushi_sam
--   00000018... = taco_tony
--   00000019... = dessert_dana

-- ============================================
-- Clear existing follows (start fresh)
-- ============================================
DELETE FROM public.user_follows;

-- ============================================
-- Demo User follows everyone (for testing)
-- This ensures the demo feed shows all activity
-- ============================================
INSERT INTO public.user_follows (follower_id, following_id, created_at) VALUES
-- Demo follows all original users
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '6 months'),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '6 months'),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '5 months'),
('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '5 months'),
('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '4 months'),
('11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', NOW() - INTERVAL '4 months'),
('11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888', NOW() - INTERVAL '3 months'),
('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', NOW() - INTERVAL '3 months'),
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '2 months'),
-- Demo follows all new users
('11111111-1111-1111-1111-111111111111', '0000000b-0000-0000-0000-00000000000b', NOW() - INTERVAL '2 months'),
('11111111-1111-1111-1111-111111111111', '0000000c-0000-0000-0000-00000000000c', NOW() - INTERVAL '2 months'),
('11111111-1111-1111-1111-111111111111', '0000000d-0000-0000-0000-00000000000d', NOW() - INTERVAL '1 month'),
('11111111-1111-1111-1111-111111111111', '0000000e-0000-0000-0000-00000000000e', NOW() - INTERVAL '1 month'),
('11111111-1111-1111-1111-111111111111', '0000000f-0000-0000-0000-00000000000f', NOW() - INTERVAL '1 month'),
('11111111-1111-1111-1111-111111111111', '00000010-0000-0000-0000-000000000010', NOW() - INTERVAL '3 weeks'),
('11111111-1111-1111-1111-111111111111', '00000011-0000-0000-0000-000000000011', NOW() - INTERVAL '3 weeks'),
('11111111-1111-1111-1111-111111111111', '00000012-0000-0000-0000-000000000012', NOW() - INTERVAL '2 weeks'),
('11111111-1111-1111-1111-111111111111', '00000013-0000-0000-0000-000000000013', NOW() - INTERVAL '2 weeks'),
('11111111-1111-1111-1111-111111111111', '00000014-0000-0000-0000-000000000014', NOW() - INTERVAL '1 week'),
('11111111-1111-1111-1111-111111111111', '00000015-0000-0000-0000-000000000015', NOW() - INTERVAL '1 week'),
('11111111-1111-1111-1111-111111111111', '00000016-0000-0000-0000-000000000016', NOW() - INTERVAL '5 days'),
('11111111-1111-1111-1111-111111111111', '00000017-0000-0000-0000-000000000017', NOW() - INTERVAL '3 days'),
('11111111-1111-1111-1111-111111111111', '00000018-0000-0000-0000-000000000018', NOW() - INTERVAL '2 days'),
('11111111-1111-1111-1111-111111111111', '00000019-0000-0000-0000-000000000019', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;
-- 24 follows from demo user

-- ============================================
-- Everyone follows the top tastemakers
-- (chef_mike, sushi_sarah, chinatown_chen are most popular)
-- ============================================
INSERT INTO public.user_follows (follower_id, following_id, created_at) VALUES
-- Following chef_mike (33333333)
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '10 months'),
('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '8 months'),
('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '7 months'),
('77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '6 months'),
('0000000d-0000-0000-0000-00000000000d', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '4 months'),
('00000012-0000-0000-0000-000000000012', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '3 months'),
('00000013-0000-0000-0000-000000000013', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '2 months'),
('00000019-0000-0000-0000-000000000019', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '1 month'),

-- Following chinatown_chen (0000000c) - Dim sum expert
('22222222-2222-2222-2222-222222222222', '0000000c-0000-0000-0000-00000000000c', NOW() - INTERVAL '5 months'),
('44444444-4444-4444-4444-444444444444', '0000000c-0000-0000-0000-00000000000c', NOW() - INTERVAL '4 months'),
('00000017-0000-0000-0000-000000000017', '0000000c-0000-0000-0000-00000000000c', NOW() - INTERVAL '3 months'),
('00000016-0000-0000-0000-000000000016', '0000000c-0000-0000-0000-00000000000c', NOW() - INTERVAL '2 months'),

-- Following sushi_sarah (66666666)
('44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '6 months'),
('00000017-0000-0000-0000-000000000017', '66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '5 months'),
('00000013-0000-0000-0000-000000000013', '66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '3 months')
ON CONFLICT DO NOTHING;
-- 15 follows to top tastemakers

-- ============================================
-- Friend Cluster 1: Brooklyn Foodies
-- (williamsburg_will, vegan_victor, coffee_carla, bbq_bobby)
-- Mutual follows within the group
-- ============================================
INSERT INTO public.user_follows (follower_id, following_id, created_at) VALUES
-- williamsburg_will <-> vegan_victor
('0000000d-0000-0000-0000-00000000000d', '00000014-0000-0000-0000-000000000014', NOW() - INTERVAL '8 months'),
('00000014-0000-0000-0000-000000000014', '0000000d-0000-0000-0000-00000000000d', NOW() - INTERVAL '8 months'),
-- williamsburg_will <-> coffee_carla
('0000000d-0000-0000-0000-00000000000d', '00000015-0000-0000-0000-000000000015', NOW() - INTERVAL '7 months'),
('00000015-0000-0000-0000-000000000015', '0000000d-0000-0000-0000-00000000000d', NOW() - INTERVAL '7 months'),
-- vegan_victor <-> coffee_carla
('00000014-0000-0000-0000-000000000014', '00000015-0000-0000-0000-000000000015', NOW() - INTERVAL '6 months'),
('00000015-0000-0000-0000-000000000015', '00000014-0000-0000-0000-000000000014', NOW() - INTERVAL '6 months'),
-- bbq_bobby connects to the Brooklyn crew
('00000010-0000-0000-0000-000000000010', '0000000d-0000-0000-0000-00000000000d', NOW() - INTERVAL '5 months'),
('0000000d-0000-0000-0000-00000000000d', '00000010-0000-0000-0000-000000000010', NOW() - INTERVAL '5 months')
ON CONFLICT DO NOTHING;
-- 8 follows in Brooklyn cluster

-- ============================================
-- Friend Cluster 2: Manhattan Lifestyle
-- (brunch_brad, datenight_diana, dessert_dana, bagel_ben)
-- ============================================
INSERT INTO public.user_follows (follower_id, following_id, created_at) VALUES
-- brunch_brad <-> datenight_diana
('00000012-0000-0000-0000-000000000012', '00000013-0000-0000-0000-000000000013', NOW() - INTERVAL '5 months'),
('00000013-0000-0000-0000-000000000013', '00000012-0000-0000-0000-000000000012', NOW() - INTERVAL '5 months'),
-- brunch_brad <-> dessert_dana
('00000012-0000-0000-0000-000000000012', '00000019-0000-0000-0000-000000000019', NOW() - INTERVAL '4 months'),
('00000019-0000-0000-0000-000000000019', '00000012-0000-0000-0000-000000000012', NOW() - INTERVAL '4 months'),
-- datenight_diana <-> dessert_dana
('00000013-0000-0000-0000-000000000013', '00000019-0000-0000-0000-000000000019', NOW() - INTERVAL '3 months'),
('00000019-0000-0000-0000-000000000019', '00000013-0000-0000-0000-000000000013', NOW() - INTERVAL '3 months'),
-- bagel_ben is the NYC native everyone knows
('00000016-0000-0000-0000-000000000016', '00000012-0000-0000-0000-000000000012', NOW() - INTERVAL '10 months'),
('00000016-0000-0000-0000-000000000016', '00000013-0000-0000-0000-000000000013', NOW() - INTERVAL '9 months')
ON CONFLICT DO NOTHING;
-- 8 follows in Manhattan cluster

-- ============================================
-- Friend Cluster 3: Queens Food Scene
-- (astoria_andy, thai_tina, indian_ian, taco_tony)
-- ============================================
INSERT INTO public.user_follows (follower_id, following_id, created_at) VALUES
-- astoria_andy <-> thai_tina (both Queens tastemakers)
('0000000b-0000-0000-0000-00000000000b', '0000000e-0000-0000-0000-00000000000e', NOW() - INTERVAL '12 months'),
('0000000e-0000-0000-0000-00000000000e', '0000000b-0000-0000-0000-00000000000b', NOW() - INTERVAL '12 months'),
-- indian_ian <-> taco_tony (Jackson Heights neighbors)
('0000000f-0000-0000-0000-00000000000f', '00000018-0000-0000-0000-000000000018', NOW() - INTERVAL '6 months'),
('00000018-0000-0000-0000-000000000018', '0000000f-0000-0000-0000-00000000000f', NOW() - INTERVAL '6 months'),
-- Connections across the cluster
('0000000f-0000-0000-0000-00000000000f', '0000000b-0000-0000-0000-00000000000b', NOW() - INTERVAL '5 months'),
('00000018-0000-0000-0000-000000000018', '0000000e-0000-0000-0000-00000000000e', NOW() - INTERVAL '4 months')
ON CONFLICT DO NOTHING;
-- 6 follows in Queens cluster

-- ============================================
-- Night Owl Connection
-- (latenight_lisa, late_night_leo - kindred spirits)
-- ============================================
INSERT INTO public.user_follows (follower_id, following_id, created_at) VALUES
('00000011-0000-0000-0000-000000000011', '88888888-8888-8888-8888-888888888888', NOW() - INTERVAL '4 months'),
('88888888-8888-8888-8888-888888888888', '00000011-0000-0000-0000-000000000011', NOW() - INTERVAL '4 months')
ON CONFLICT DO NOTHING;
-- 2 follows

-- ============================================
-- Some follow demo user back (reciprocal)
-- ============================================
INSERT INTO public.user_follows (follower_id, following_id, created_at) VALUES
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '5 months'),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '4 months'),
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '3 months'),
('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 months'),
('0000000d-0000-0000-0000-00000000000d', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '1 month')
ON CONFLICT DO NOTHING;
-- 5 follows back to demo user

-- ============================================
-- Verify
-- ============================================
SELECT
  COUNT(*) as total_follows,
  COUNT(DISTINCT follower_id) as unique_followers,
  COUNT(DISTINCT following_id) as unique_following
FROM public.user_follows;

-- Show follow counts per user
SELECT
  u.username,
  (SELECT COUNT(*) FROM user_follows WHERE follower_id = u.id) as following_count,
  (SELECT COUNT(*) FROM user_follows WHERE following_id = u.id) as follower_count
FROM users u
ORDER BY follower_count DESC;
