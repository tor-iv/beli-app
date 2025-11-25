-- Seed: Demo Users for Beli App
--
-- Creates 10 demo users with realistic profiles for the founder demo.
-- Uses deterministic UUIDs so ratings can reference them.
--
-- Note: These bypass auth.users - for demo only. Production would use Supabase Auth.

-- ============================================
-- Temporarily disable auth.users FK for seeding
-- ============================================
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- ============================================
-- Demo Users
-- ============================================

INSERT INTO public.users (id, username, display_name, avatar, bio, city, state, is_tastemaker, created_at)
VALUES
-- Main demo user (Tor - founder)
(
  '11111111-1111-1111-1111-111111111111',
  'tor_iv',
  'Tor Cox',
  '/profile-tor.jpg',
  'Food enthusiast exploring NYC. Always hunting for the perfect slice',
  'New York',
  'NY',
  false,
  NOW() - INTERVAL '6 months'
),

-- Active food enthusiasts (friends)
(
  '22222222-2222-2222-2222-222222222222',
  'sarah_eats',
  'Sarah Chen',
  'https://i.pravatar.cc/150?u=sarah',
  'Always hunting for the best dumplings in Chinatown',
  'New York',
  'NY',
  false,
  NOW() - INTERVAL '8 months'
),
(
  '33333333-3333-3333-3333-333333333333',
  'mike_foodie',
  'Mike Rodriguez',
  'https://i.pravatar.cc/150?u=mike',
  'Pizza connoisseur. Brooklyn native.',
  'Brooklyn',
  'NY',
  false,
  NOW() - INTERVAL '1 year'
),
(
  '44444444-4444-4444-4444-444444444444',
  'emma_bites',
  'Emma Thompson',
  'https://i.pravatar.cc/150?u=emma',
  'Brunch enthusiast and coffee addict',
  'New York',
  'NY',
  false,
  NOW() - INTERVAL '4 months'
),
(
  '55555555-5555-5555-5555-555555555555',
  'alex_cuisine',
  'Alex Kim',
  'https://i.pravatar.cc/150?u=alex',
  'Fine dining explorer. Always dressed for the occasion.',
  'Manhattan',
  'NY',
  false,
  NOW() - INTERVAL '10 months'
),

-- Tastemakers (food experts)
(
  '66666666-6666-6666-6666-666666666666',
  'pizza_pete',
  'Pete Zaroll',
  'https://i.pravatar.cc/150?u=pete',
  'NYC Pizza Expert. Eaten at 500+ pizza spots.',
  'New York',
  'NY',
  true,
  NOW() - INTERVAL '2 years'
),
(
  '77777777-7777-7777-7777-777777777777',
  'ramen_rachel',
  'Rachel Tanaka',
  'https://i.pravatar.cc/150?u=rachel',
  'Ramen specialist. Lived in Tokyo for 3 years.',
  'New York',
  'NY',
  true,
  NOW() - INTERVAL '18 months'
),
(
  '88888888-8888-8888-8888-888888888888',
  'budget_benny',
  'Benny Martinez',
  'https://i.pravatar.cc/150?u=benny',
  'Finding the best eats under $15. Your wallet will thank me.',
  'Queens',
  'NY',
  true,
  NOW() - INTERVAL '14 months'
),

-- Additional users for social graph
(
  '99999999-9999-9999-9999-999999999999',
  'foodie_fiona',
  'Fiona Walsh',
  'https://i.pravatar.cc/150?u=fiona',
  'Food photographer. Eat with your eyes first.',
  'Brooklyn',
  'NY',
  false,
  NOW() - INTERVAL '7 months'
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'chef_carlos',
  'Carlos Mendez',
  'https://i.pravatar.cc/150?u=carlos',
  'Professional chef. Off-duty food explorer.',
  'New York',
  'NY',
  false,
  NOW() - INTERVAL '5 months'
)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  avatar = EXCLUDED.avatar,
  bio = EXCLUDED.bio,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  is_tastemaker = EXCLUDED.is_tastemaker;

-- ============================================
-- Social Graph (who follows whom)
-- ============================================

INSERT INTO public.user_follows (follower_id, following_id, created_at)
VALUES
-- Demo user follows everyone
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '5 months'),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '5 months'),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '4 months'),
('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '3 months'),
('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '5 months'),
('11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', NOW() - INTERVAL '4 months'),
('11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888', NOW() - INTERVAL '3 months'),

-- Some mutual follows (friends)
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '5 months'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '5 months'),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '4 months'),

-- Cross-follows between other users
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '6 months'),
('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '6 months'),
('22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '7 months'),
('33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '8 months'),
('44444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777', NOW() - INTERVAL '3 months'),
('55555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', NOW() - INTERVAL '2 months'),
('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '1 month'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '2 months')
ON CONFLICT DO NOTHING;

-- ============================================
-- Verify
-- ============================================

-- Should show 10 users
SELECT COUNT(*) as user_count FROM public.users;

-- Should show social connections
SELECT
  (SELECT COUNT(*) FROM public.user_follows) as total_follows,
  (SELECT COUNT(*) FROM public.users WHERE is_tastemaker = true) as tastemaker_count;

-- Note: FK to auth.users was dropped for seeding.
-- In production, users would be created via Supabase Auth signup flow.
