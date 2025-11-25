SELECT 'Restaurants' as entity, COUNT(*) as count FROM public.restaurants
UNION ALL
SELECT 'Users', COUNT(*) FROM public.users
UNION ALL
SELECT 'Ratings (total)', COUNT(*) FROM public.ratings
UNION ALL
SELECT 'Ratings (been)', COUNT(*) FROM public.ratings WHERE status = 'been'
UNION ALL
SELECT 'Ratings (want_to_try)', COUNT(*) FROM public.ratings WHERE status = 'want_to_try';
