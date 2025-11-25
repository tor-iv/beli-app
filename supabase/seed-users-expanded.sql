-- Seed: Expanded Demo Users for Beli App
--
-- Adds 15 more users to the existing 10, for 25 total.
-- Diverse personas: neighborhood specialists, cuisine experts, activity types
-- 8 total tastemakers (3 existing + 5 new)

-- ============================================
-- Temporarily disable auth.users FK for seeding
-- ============================================
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- ============================================
-- New Users (IDs use valid hex: 0-9, a-f)
-- Pattern: 0000000b through 00000019
-- ============================================

INSERT INTO public.users (id, username, display_name, avatar, bio, city, state, is_tastemaker, created_at)
VALUES
-- Neighborhood Specialists
(
  '0000000b-0000-0000-0000-00000000000b',
  'astoria_andy',
  'Andy Papadopoulos',
  'https://i.pravatar.cc/150?u=andy',
  'Astoria local since birth. Greek food is my specialty, but I know every good spot in the neighborhood.',
  'Queens',
  'NY',
  true,  -- Tastemaker
  NOW() - INTERVAL '16 months'
),
(
  '0000000c-0000-0000-0000-00000000000c',
  'chinatown_chen',
  'Lily Chen',
  'https://i.pravatar.cc/150?u=lily',
  'Born in Chinatown, know every dim sum spot and hidden noodle shop. Ask me about soup dumplings!',
  'New York',
  'NY',
  true,  -- Tastemaker
  NOW() - INTERVAL '20 months'
),
(
  '0000000d-0000-0000-0000-00000000000d',
  'williamsburg_will',
  'Will Martinez',
  'https://i.pravatar.cc/150?u=will',
  'Williamsburg resident. I track every new opening in Brooklyn before it hits the blogs.',
  'Brooklyn',
  'NY',
  false,
  NOW() - INTERVAL '11 months'
),

-- Cuisine Specialists
(
  '0000000e-0000-0000-0000-00000000000e',
  'thai_tina',
  'Tina Srisawat',
  'https://i.pravatar.cc/150?u=tina',
  'Thai food expert. Grew up cooking with my grandmother in Bangkok. NYC has amazing Thai if you know where to look.',
  'Queens',
  'NY',
  true,  -- Tastemaker
  NOW() - INTERVAL '15 months'
),
(
  '0000000f-0000-0000-0000-00000000000f',
  'indian_ian',
  'Ian Patel',
  'https://i.pravatar.cc/150?u=ian',
  'Indian food is my passion. From street food in Jackson Heights to fine dining in Manhattan, I''ve tried it all.',
  'Queens',
  'NY',
  false,
  NOW() - INTERVAL '9 months'
),
(
  '00000010-0000-0000-0000-000000000010',
  'bbq_bobby',
  'Bobby Smoke',
  'https://i.pravatar.cc/150?u=bobby',
  'BBQ pitmaster and judge. I''ve competed in 50+ competitions. NYC''s BBQ scene is underrated.',
  'Brooklyn',
  'NY',
  true,  -- Tastemaker
  NOW() - INTERVAL '24 months'
),

-- Activity Type Users
(
  '00000011-0000-0000-0000-000000000011',
  'latenight_lisa',
  'Lisa Nightingale',
  'https://i.pravatar.cc/150?u=lisa',
  'Night owl. I know every spot open after midnight. Best late-night eats in the city.',
  'Manhattan',
  'NY',
  false,
  NOW() - INTERVAL '8 months'
),
(
  '00000012-0000-0000-0000-000000000012',
  'brunch_brad',
  'Brad Mimosa',
  'https://i.pravatar.cc/150?u=brad',
  'Weekend warrior. Bottomless brunch is my sport. I''ve brunched at 200+ spots.',
  'Manhattan',
  'NY',
  false,
  NOW() - INTERVAL '13 months'
),
(
  '00000013-0000-0000-0000-000000000013',
  'datenight_diana',
  'Diana Romance',
  'https://i.pravatar.cc/150?u=diana',
  'Always planning the perfect date night. Romantic spots, intimate vibes, great wine lists.',
  'Manhattan',
  'NY',
  false,
  NOW() - INTERVAL '6 months'
),

-- General Foodies (diverse interests)
(
  '00000014-0000-0000-0000-000000000014',
  'vegan_victor',
  'Victor Green',
  'https://i.pravatar.cc/150?u=victor',
  'Plant-based for 5 years. NYC vegan scene is incredible. Always finding new spots.',
  'Brooklyn',
  'NY',
  false,
  NOW() - INTERVAL '10 months'
),
(
  '00000015-0000-0000-0000-000000000015',
  'coffee_carla',
  'Carla Cortado',
  'https://i.pravatar.cc/150?u=carla',
  'Coffee obsessed. Third-wave, specialty roasters, latte art - I''ve mapped every good cafe in NYC.',
  'Brooklyn',
  'NY',
  true,  -- Tastemaker
  NOW() - INTERVAL '19 months'
),
(
  '00000016-0000-0000-0000-000000000016',
  'bagel_ben',
  'Ben Goldstein',
  'https://i.pravatar.cc/150?u=ben',
  'NYC native. Strong opinions on bagels. Don''t @ me about toasting.',
  'Manhattan',
  'NY',
  false,
  NOW() - INTERVAL '22 months'
),
(
  '00000017-0000-0000-0000-000000000017',
  'sushi_sam',
  'Sam Tanaka',
  'https://i.pravatar.cc/150?u=sam',
  'Sushi connoisseur. From omakase to bodega rolls, I appreciate it all. Studied in Tokyo for a year.',
  'Manhattan',
  'NY',
  false,
  NOW() - INTERVAL '12 months'
),
(
  '00000018-0000-0000-0000-000000000018',
  'taco_tony',
  'Tony Moreno',
  'https://i.pravatar.cc/150?u=tony',
  'Mexican food is life. Tacos, tortas, tamales - I know every authentic spot from Corona to Sunset Park.',
  'Queens',
  'NY',
  false,
  NOW() - INTERVAL '14 months'
),
(
  '00000019-0000-0000-0000-000000000019',
  'dessert_dana',
  'Dana Sweet',
  'https://i.pravatar.cc/150?u=dana',
  'Life is short, eat dessert first. Pastries, ice cream, chocolate - if it''s sweet, I''ve reviewed it.',
  'Manhattan',
  'NY',
  false,
  NOW() - INTERVAL '7 months'
)
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  is_tastemaker = EXCLUDED.is_tastemaker;

-- ============================================
-- Verify
-- ============================================
SELECT
  COUNT(*) as total_users,
  COUNT(CASE WHEN is_tastemaker THEN 1 END) as tastemaker_count
FROM public.users;
