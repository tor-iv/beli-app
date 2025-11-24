-- Seed: Demo Ratings for Beli App
--
-- Creates sample ratings (user-restaurant relationships) for demo.
-- Uses actual restaurant IDs from the database.

-- ============================================
-- Helper: Get some restaurant IDs by name pattern
-- ============================================

-- Demo User's ratings (been to these)
INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT
  '11111111-1111-1111-1111-111111111111',
  id,
  'been',
  8.5,
  'Amazing pizza! The crust is perfectly crispy.',
  CURRENT_DATE - INTERVAL '2 weeks',
  NOW() - INTERVAL '2 weeks'
FROM public.restaurants WHERE name = 'JOE''S PIZZA'
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT
  '11111111-1111-1111-1111-111111111111',
  id,
  'been',
  7.8,
  'Great dim sum, busy on weekends.',
  CURRENT_DATE - INTERVAL '1 month',
  NOW() - INTERVAL '1 month'
FROM public.restaurants WHERE name = 'GRANDMA''S DIM SUM'
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT
  '11111111-1111-1111-1111-111111111111',
  id,
  'been',
  8.9,
  'Best burrito in Midtown!',
  CURRENT_DATE - INTERVAL '3 weeks',
  NOW() - INTERVAL '3 weeks'
FROM public.restaurants WHERE name = 'CHIPOTLE MEXICAN GRILL'
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- Demo User's want-to-try list
INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, created_at)
SELECT
  '11111111-1111-1111-1111-111111111111',
  id,
  'want_to_try',
  NULL,
  'Heard their bagels are legendary',
  NOW() - INTERVAL '1 week'
FROM public.restaurants WHERE name ILIKE '%BAGEL%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, created_at)
SELECT
  '11111111-1111-1111-1111-111111111111',
  id,
  'want_to_try',
  NULL,
  'Sarah recommended this place',
  NOW() - INTERVAL '3 days'
FROM public.restaurants WHERE name = 'NEW KING WOK'
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Sarah's ratings (dumpling enthusiast)
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT
  '22222222-2222-2222-2222-222222222222',
  id,
  'been',
  9.2,
  'Best soup dumplings in Chinatown! Must get the xiao long bao.',
  CURRENT_DATE - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
FROM public.restaurants WHERE name = 'GRANDMA''S DIM SUM'
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT
  '22222222-2222-2222-2222-222222222222',
  id,
  'been',
  8.7,
  'Authentic Chinese flavors. Try the kung pao chicken.',
  CURRENT_DATE - INTERVAL '2 weeks',
  NOW() - INTERVAL '2 weeks'
FROM public.restaurants WHERE name = 'NEW KING WOK'
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Mike's ratings (pizza connoisseur)
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT
  '33333333-3333-3333-3333-333333333333',
  id,
  'been',
  9.5,
  'THE gold standard for NYC pizza. No frills, just perfection.',
  CURRENT_DATE - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
FROM public.restaurants WHERE name = 'JOE''S PIZZA'
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT
  '33333333-3333-3333-3333-333333333333',
  id,
  'been',
  7.5,
  'Decent chain pizza but nothing special.',
  CURRENT_DATE - INTERVAL '1 month',
  NOW() - INTERVAL '1 month'
FROM public.restaurants WHERE name = 'PAPA JOHN''S PIZZA'
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Emma's ratings (brunch enthusiast)
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT
  '44444444-4444-4444-4444-444444444444',
  id,
  'been',
  8.3,
  'Great coffee and pastries. Perfect morning spot.',
  CURRENT_DATE - INTERVAL '1 week',
  NOW() - INTERVAL '1 week'
FROM public.restaurants WHERE name = 'BRIARWOOD CAFE'
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT
  '44444444-4444-4444-4444-444444444444',
  id,
  'been',
  7.9,
  'Good bagels, fast service.',
  CURRENT_DATE - INTERVAL '2 weeks',
  NOW() - INTERVAL '2 weeks'
FROM public.restaurants WHERE name ILIKE '%BAGEL%' LIMIT 1
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Pizza Pete's ratings (tastemaker)
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT
  '66666666-6666-6666-6666-666666666666',
  id,
  'been',
  9.8,
  'As a pizza expert, I can confirm: this is as good as it gets. The char on the crust, the sauce-to-cheese ratio, the fold. Perfect.',
  CURRENT_DATE - INTERVAL '1 week',
  NOW() - INTERVAL '1 week'
FROM public.restaurants WHERE name = 'JOE''S PIZZA'
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT
  '66666666-6666-6666-6666-666666666666',
  id,
  'been',
  6.5,
  'Chain pizza. Fine for what it is, but not memorable.',
  CURRENT_DATE - INTERVAL '2 months',
  NOW() - INTERVAL '2 months'
FROM public.restaurants WHERE name = 'PAPA JOHN''S PIZZA'
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Budget Benny's ratings (tastemaker - budget eats)
-- ============================================

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT
  '88888888-8888-8888-8888-888888888888',
  id,
  'been',
  8.8,
  '$3 slice that tastes like a million bucks. BEST value in NYC.',
  CURRENT_DATE - INTERVAL '4 days',
  NOW() - INTERVAL '4 days'
FROM public.restaurants WHERE name = 'JOE''S PIZZA'
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT
  '88888888-8888-8888-8888-888888888888',
  id,
  'been',
  8.5,
  'Under $10 for a filling meal. Fast, reliable, cheap.',
  CURRENT_DATE - INTERVAL '1 week',
  NOW() - INTERVAL '1 week'
FROM public.restaurants WHERE name = 'CHIPOTLE MEXICAN GRILL'
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT
  '88888888-8888-8888-8888-888888888888',
  id,
  'been',
  7.0,
  'Not gourmet but wallet-friendly. Good for a quick bite.',
  CURRENT_DATE - INTERVAL '3 weeks',
  NOW() - INTERVAL '3 weeks'
FROM public.restaurants WHERE name = 'PANDA EXPRESS'
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- More variety - random users rating random restaurants
-- ============================================

-- Alex (fine dining) tries various spots
INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT
  '55555555-5555-5555-5555-555555555555',
  id,
  'been',
  8.0,
  'Solid Italian comfort food.',
  CURRENT_DATE - INTERVAL '2 weeks',
  NOW() - INTERVAL '2 weeks'
FROM public.restaurants WHERE name = 'CASA TEVERE'
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- Fiona (photographer) documents meals
INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT
  '99999999-9999-9999-9999-999999999999',
  id,
  'been',
  8.6,
  'Incredibly photogenic plates. The presentation is art.',
  CURRENT_DATE - INTERVAL '6 days',
  NOW() - INTERVAL '6 days'
FROM public.restaurants WHERE name = 'YURA'
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- Chef Carlos evaluates
INSERT INTO public.ratings (user_id, restaurant_id, status, rating, notes, visit_date, created_at)
SELECT
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  id,
  'been',
  8.2,
  'As a chef, I appreciate the technique here. Well-executed.',
  CURRENT_DATE - INTERVAL '10 days',
  NOW() - INTERVAL '10 days'
FROM public.restaurants WHERE name = 'HIBISCUS RESTAURANT'
ON CONFLICT (user_id, restaurant_id) DO NOTHING;

-- ============================================
-- Verify
-- ============================================

SELECT
  COUNT(*) as total_ratings,
  COUNT(CASE WHEN status = 'been' THEN 1 END) as been_count,
  COUNT(CASE WHEN status = 'want_to_try' THEN 1 END) as want_to_try_count
FROM public.ratings;

-- Show feed preview
SELECT
  u.display_name,
  r.status,
  rest.name as restaurant,
  r.rating,
  r.created_at::date as date
FROM public.ratings r
JOIN public.users u ON r.user_id = u.id
JOIN public.restaurants rest ON r.restaurant_id = rest.id
ORDER BY r.created_at DESC
LIMIT 10;
