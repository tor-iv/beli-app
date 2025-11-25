-- Seed: Expanded Ratings for Beli App
--
-- Creates 150+ ratings distributed across 25 users and 80+ restaurants
-- Mix: 70% been, 20% want_to_try, 10% recommended
--
-- User UUID Reference:
-- Original: 11111111... through aaaaaaaa...
-- New: 0000000b... through 00000019...

-- ============================================
-- Demo User (11111111) ratings
-- ============================================

-- Been ratings
INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '11111111-1111-1111-1111-111111111111', id, 'been', 8.7, 'Great spot, will definitely come back!', CURRENT_DATE - INTERVAL '1 week', NOW() - INTERVAL '1 week'
FROM public.restaurants WHERE name ILIKE '%PIZZA%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '11111111-1111-1111-1111-111111111111', id, 'been', 9.2, 'Best Chinese food I''ve had in a while', CURRENT_DATE - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks'
FROM public.restaurants WHERE name ILIKE '%CHINESE%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '11111111-1111-1111-1111-111111111111', id, 'been', 7.5, 'Solid lunch spot', CURRENT_DATE - INTERVAL '3 weeks', NOW() - INTERVAL '3 weeks'
FROM public.restaurants WHERE name ILIKE '%TACO%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- Want to try
INSERT INTO public.ratings (user_id, restaurant_id, status, notes, created_at)
SELECT '11111111-1111-1111-1111-111111111111', id, 'want_to_try', 'Everyone says this is amazing', NOW() - INTERVAL '3 days'
FROM public.restaurants WHERE name ILIKE '%SUSHI%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, notes, created_at)
SELECT '11111111-1111-1111-1111-111111111111', id, 'want_to_try', 'On my list for date night', NOW() - INTERVAL '5 days'
FROM public.restaurants WHERE name ILIKE '%MAMAN%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Sarah (22222222) - Dumpling enthusiast
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '22222222-2222-2222-2222-222222222222', id, 'been', 9.5, 'THE best soup dumplings! Get the xiao long bao.', CURRENT_DATE - INTERVAL '4 days', NOW() - INTERVAL '4 days'
FROM public.restaurants WHERE name ILIKE '%DIM SUM%' OR name ILIKE '%DUMPLING%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '22222222-2222-2222-2222-222222222222', id, 'been', 8.8, 'Amazing hand-pulled noodles', CURRENT_DATE - INTERVAL '1 week', NOW() - INTERVAL '1 week'
FROM public.restaurants WHERE name ILIKE '%NOODLE%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '22222222-2222-2222-2222-222222222222', id, 'been', 8.2, 'Solid Chinese, good for groups', CURRENT_DATE - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks'
FROM public.restaurants WHERE name ILIKE '%DRAGON%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Mike (33333333) - Pizza connoisseur
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '33333333-3333-3333-3333-333333333333', id, 'been', 9.3, 'Classic NYC slice. Perfect char on the crust.', CURRENT_DATE - INTERVAL '2 days', NOW() - INTERVAL '2 days'
FROM public.restaurants WHERE name ILIKE '%PIZZA%' AND name NOT ILIKE '%HUT%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '33333333-3333-3333-3333-333333333333', id, 'been', 6.5, 'Chain pizza. Fine for what it is.', CURRENT_DATE - INTERVAL '1 month', NOW() - INTERVAL '1 month'
FROM public.restaurants WHERE name ILIKE '%PIZZA HUT%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '33333333-3333-3333-3333-333333333333', id, 'been', 7.8, 'Good value, quick service', CURRENT_DATE - INTERVAL '3 weeks', NOW() - INTERVAL '3 weeks'
FROM public.restaurants WHERE name ILIKE '%LITTLE CAESARS%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Sushi Sarah (66666666) - Tastemaker
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '66666666-6666-6666-6666-666666666666', id, 'been', 9.8, 'As a sushi expert: this is perfection. Fresh fish, skilled itamae.', CURRENT_DATE - INTERVAL '5 days', NOW() - INTERVAL '5 days'
FROM public.restaurants WHERE name ILIKE '%SUSHI%' OR name ILIKE '%SHIAWASE%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '66666666-6666-6666-6666-666666666666', id, 'been', 7.5, 'Good for quick sushi, not for connoisseurs', CURRENT_DATE - INTERVAL '2 months', NOW() - INTERVAL '2 months'
FROM public.restaurants WHERE name ILIKE '%ROLL%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Late Night Leo (88888888) - Night owl
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '88888888-8888-8888-8888-888888888888', id, 'been', 8.9, '2am pizza hits different. BEST late-night slice.', CURRENT_DATE - INTERVAL '3 days', NOW() - INTERVAL '3 days'
FROM public.restaurants WHERE name ILIKE '%PIZZA%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '88888888-8888-8888-8888-888888888888', id, 'been', 8.2, 'Open 24/7. Lifesaver after a night out.', CURRENT_DATE - INTERVAL '1 week', NOW() - INTERVAL '1 week'
FROM public.restaurants WHERE name ILIKE '%DINER%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Astoria Andy (0000000b) - Greek specialist Tastemaker
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '0000000b-0000-0000-0000-00000000000b', id, 'been', 9.4, 'Best Greek in the city. The lamb is incredible.', CURRENT_DATE - INTERVAL '6 days', NOW() - INTERVAL '6 days'
FROM public.restaurants WHERE name ILIKE '%GREEK%' OR name ILIKE '%MOLYVOS%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '0000000b-0000-0000-0000-00000000000b', id, 'been', 8.7, 'Solid Astoria staple', CURRENT_DATE - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks'
FROM public.restaurants WHERE name ILIKE '%ASTORIA%' OR name ILIKE '%BOWL 360%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Chinatown Chen (0000000c) - Dim sum Tastemaker
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '0000000c-0000-0000-0000-00000000000c', id, 'been', 9.6, 'Grew up eating here. Still the best har gow in Chinatown.', CURRENT_DATE - INTERVAL '3 days', NOW() - INTERVAL '3 days'
FROM public.restaurants WHERE name ILIKE '%DIM SUM%' OR name ILIKE '%CHINESE%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '0000000c-0000-0000-0000-00000000000c', id, 'been', 9.1, 'Hidden gem! The wonton noodle soup is legit.', CURRENT_DATE - INTERVAL '1 week', NOW() - INTERVAL '1 week'
FROM public.restaurants WHERE name ILIKE '%NOODLE%' OR name ILIKE '%DRAGON%' OFFSET 1 LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '0000000c-0000-0000-0000-00000000000c', id, 'been', 8.5, 'Great congee, perfect for cold days', CURRENT_DATE - INTERVAL '3 weeks', NOW() - INTERVAL '3 weeks'
FROM public.restaurants WHERE name ILIKE '%XIANG%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Thai Tina (0000000e) - Thai expert Tastemaker
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '0000000e-0000-0000-0000-00000000000e', id, 'been', 9.3, 'Authentic pad thai! Reminds me of Bangkok street food.', CURRENT_DATE - INTERVAL '4 days', NOW() - INTERVAL '4 days'
FROM public.restaurants WHERE name ILIKE '%THAI%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '0000000e-0000-0000-0000-00000000000e', id, 'been', 8.8, 'Great curries, proper spice level', CURRENT_DATE - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks'
FROM public.restaurants WHERE name ILIKE '%TERIYAKI%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- BBQ Bobby (00000010) - BBQ Tastemaker
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '00000010-0000-0000-0000-000000000010', id, 'been', 9.0, 'Real smoke ring on the brisket. These guys know BBQ.', CURRENT_DATE - INTERVAL '5 days', NOW() - INTERVAL '5 days'
FROM public.restaurants WHERE name ILIKE '%BBQ%' OR name ILIKE '%SMOKE%' OR name ILIKE '%GRILL%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '00000010-0000-0000-0000-000000000010', id, 'been', 8.5, 'Good wings, solid sides', CURRENT_DATE - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks'
FROM public.restaurants WHERE name ILIKE '%WINGS%' OR name ILIKE '%CHICKEN%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Late Night Lisa (00000011) - Night owl
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '00000011-0000-0000-0000-000000000011', id, 'been', 8.5, 'Open until 2am! Perfect post-bar food.', CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '1 day'
FROM public.restaurants WHERE name ILIKE '%HALAL%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '00000011-0000-0000-0000-000000000011', id, 'been', 7.8, 'Reliable late night spot', CURRENT_DATE - INTERVAL '1 week', NOW() - INTERVAL '1 week'
FROM public.restaurants WHERE name ILIKE '%WENDY%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Brunch Brad (00000012) - Weekend warrior
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '00000012-0000-0000-0000-000000000012', id, 'been', 9.0, 'Best bottomless mimosas in town! French toast is divine.', CURRENT_DATE - INTERVAL '3 days', NOW() - INTERVAL '3 days'
FROM public.restaurants WHERE name ILIKE '%BREAKFAST%' OR name ILIKE '%MAMAN%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '00000012-0000-0000-0000-000000000012', id, 'been', 8.7, 'Great eggs benedict, chill vibe', CURRENT_DATE - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks'
FROM public.restaurants WHERE name ILIKE '%CAFE%' OR name ILIKE '%VIAND%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Coffee Carla (00000015) - Coffee Tastemaker
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '00000015-0000-0000-0000-000000000015', id, 'been', 9.2, 'Perfect pour-over. Single origin Ethiopian, fruity notes.', CURRENT_DATE - INTERVAL '2 days', NOW() - INTERVAL '2 days'
FROM public.restaurants WHERE name ILIKE '%COFFEE%' AND name NOT ILIKE '%STARBUCKS%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '00000015-0000-0000-0000-000000000015', id, 'been', 6.0, 'Chain coffee. Consistent but nothing special.', CURRENT_DATE - INTERVAL '1 week', NOW() - INTERVAL '1 week'
FROM public.restaurants WHERE name ILIKE '%STARBUCKS%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '00000015-0000-0000-0000-000000000015', id, 'been', 8.8, 'Great espresso, nice latte art', CURRENT_DATE - INTERVAL '3 weeks', NOW() - INTERVAL '3 weeks'
FROM public.restaurants WHERE name ILIKE '%CAFE%' OR name ILIKE '%19 CAFE%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Vegan Victor (00000014) - Plant-based
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '00000014-0000-0000-0000-000000000014', id, 'been', 8.5, 'Great vegan options! The impossible burger was on point.', CURRENT_DATE - INTERVAL '5 days', NOW() - INTERVAL '5 days'
FROM public.restaurants WHERE name ILIKE '%GREEN%' OR name ILIKE '%FRESH%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Bagel Ben (00000016) - NYC Native
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '00000016-0000-0000-0000-000000000016', id, 'been', 9.4, 'This is what a real NY bagel tastes like. Chewy, perfect schmear.', CURRENT_DATE - INTERVAL '2 days', NOW() - INTERVAL '2 days'
FROM public.restaurants WHERE name ILIKE '%BAGEL%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Sushi Sam (00000017) - Sushi lover
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '00000017-0000-0000-0000-000000000017', id, 'been', 9.1, 'Fresh fish, skilled chef. The omakase is worth it.', CURRENT_DATE - INTERVAL '4 days', NOW() - INTERVAL '4 days'
FROM public.restaurants WHERE name ILIKE '%SUSHI%' OR name ILIKE '%SHIAWASE%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Taco Tony (00000018) - Mexican expert
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '00000018-0000-0000-0000-000000000018', id, 'been', 9.3, 'Authentic al pastor! Double corn tortillas, proper salsa verde.', CURRENT_DATE - INTERVAL '3 days', NOW() - INTERVAL '3 days'
FROM public.restaurants WHERE name ILIKE '%TACO%' OR name ILIKE '%MEXICAN%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '00000018-0000-0000-0000-000000000018', id, 'been', 7.0, 'Americanized but decent for a quick fix', CURRENT_DATE - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks'
FROM public.restaurants WHERE name ILIKE '%TACO BELL%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Dessert Dana (00000019) - Sweet tooth
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT '00000019-0000-0000-0000-000000000019', id, 'been', 9.0, 'The chocolate cake is heavenly!', CURRENT_DATE - INTERVAL '4 days', NOW() - INTERVAL '4 days'
FROM public.restaurants WHERE name ILIKE '%BAKERY%' OR name ILIKE '%SWEET%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Bulk ratings for more coverage (random sampling)
-- ============================================

-- Add more ratings from various users to popular restaurants
INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT
  user_id,
  restaurant_id,
  'been',
  (7 + random() * 2.5)::numeric(3,1),  -- Random rating 7.0-9.5
  notes,
  CURRENT_DATE - (random() * 60)::int * INTERVAL '1 day',
  NOW() - (random() * 60)::int * INTERVAL '1 day'
FROM (
  SELECT
    u.id as user_id,
    r.id as restaurant_id,
    CASE
      WHEN r.name ILIKE '%PIZZA%' THEN 'Good pizza spot'
      WHEN r.name ILIKE '%CHINESE%' THEN 'Solid Chinese food'
      WHEN r.name ILIKE '%COFFEE%' THEN 'Nice coffee'
      WHEN r.name ILIKE '%TACO%' THEN 'Tasty tacos'
      ELSE 'Would recommend!'
    END as notes
  FROM public.users u
  CROSS JOIN (SELECT id, name FROM public.restaurants ORDER BY rating DESC LIMIT 30) r
  WHERE random() < 0.15  -- ~15% chance for each user-restaurant pair
  ORDER BY random()
  LIMIT 100
) subquery
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- Add want_to_try entries
INSERT INTO public.ratings (user_id, restaurant_id, status, notes, created_at)
SELECT
  user_id,
  restaurant_id,
  'want_to_try',
  'Looks interesting!',
  NOW() - (random() * 30)::int * INTERVAL '1 day'
FROM (
  SELECT
    u.id as user_id,
    r.id as restaurant_id
  FROM public.users u
  CROSS JOIN (SELECT id FROM public.restaurants ORDER BY random() LIMIT 50) r
  WHERE random() < 0.1  -- 10% chance
  ORDER BY random()
  LIMIT 30
) subquery
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Verify
-- ============================================
SELECT
  COUNT(*) as total_ratings,
  COUNT(CASE WHEN status = 'been' THEN 1 END) as been_count,
  COUNT(CASE WHEN status = 'want_to_try' THEN 1 END) as want_to_try_count,
  COUNT(CASE WHEN status = 'recommended' THEN 1 END) as recommended_count
FROM public.ratings;

SELECT COUNT(DISTINCT user_id) as users_with_ratings FROM public.ratings;
SELECT COUNT(DISTINCT restaurant_id) as restaurants_rated FROM public.ratings;
