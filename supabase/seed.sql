-- Seed Data for Beli App
-- Sample restaurants, users, and relationships for development

-- Note: Run this AFTER migrations
-- Usage: psql <connection-string> -f seed.sql

-- ========== Sample Restaurants ==========

INSERT INTO public.restaurants (
  name, cuisine, category, price_range,
  address, city, state, neighborhood,
  coordinates,
  hours,
  phone, website,
  tags, popular_dishes, good_for,
  rating, rating_count,
  rec_score, friend_score, average_score,
  is_open, accepts_reservations
) VALUES
(
  'Joe''s Pizza',
  '["Italian", "Pizza"]'::jsonb,
  'restaurants',
  '$',
  '7 Carmine St',
  'New York',
  'NY',
  'Greenwich Village',
  ST_SetSRID(ST_MakePoint(-74.0023, 40.7308), 4326)::geography,
  '{"monday": "10:00 AM - 4:00 AM", "tuesday": "10:00 AM - 4:00 AM", "wednesday": "10:00 AM - 4:00 AM", "thursday": "10:00 AM - 4:00 AM", "friday": "10:00 AM - 5:00 AM", "saturday": "10:00 AM - 5:00 AM", "sunday": "10:00 AM - 4:00 AM"}'::jsonb,
  '(212) 366-1182',
  'https://joespizzanyc.com',
  '["iconic", "late-night", "cash-only"]'::text[],
  '["Plain Cheese Slice", "Pepperoni Slice", "Sicilian Slice"]'::text[],
  '["Quick Bite", "Late Night", "Casual Dining"]'::text[],
  8.7, 1247,
  9.2, 8.5, 8.7,
  true, false
),
(
  'Le Bernardin',
  '["French", "Seafood", "Fine Dining"]'::jsonb,
  'restaurants',
  '$$$$',
  '155 W 51st St',
  'New York',
  'NY',
  'Midtown',
  ST_SetSRID(ST_MakePoint(-73.9776, 40.7614), 4326)::geography,
  '{"monday": "5:00 PM - 10:00 PM", "tuesday": "5:00 PM - 10:00 PM", "wednesday": "5:00 PM - 10:00 PM", "thursday": "5:00 PM - 10:00 PM", "friday": "5:00 PM - 10:30 PM", "saturday": "5:00 PM - 10:30 PM", "sunday": "Closed"}'::jsonb,
  '(212) 554-1515',
  'https://le-bernardin.com',
  '["michelin-star", "romantic", "special-occasion", "business-dining"]'::text[],
  '["Tuna Carpaccio", "Black Bass", "Dover Sole"]'::text[],
  '["Special Occasion", "Business Dinners", "Date Night", "Celebrations"]'::text[],
  9.6, 892,
  9.8, 9.4, 9.6,
  true, true
),
(
  'Shake Shack',
  '["American", "Burgers", "Fast Food"]'::jsonb,
  'restaurants',
  '$$',
  'Madison Square Park',
  'New York',
  'NY',
  'Madison Square Park',
  ST_SetSRID(ST_MakePoint(-73.9882, 40.7414), 4326)::geography,
  '{"monday": "11:00 AM - 11:00 PM", "tuesday": "11:00 AM - 11:00 PM", "wednesday": "11:00 AM - 11:00 PM", "thursday": "11:00 AM - 11:00 PM", "friday": "11:00 AM - 12:00 AM", "saturday": "11:00 AM - 12:00 AM", "sunday": "11:00 AM - 11:00 PM"}'::jsonb,
  '(212) 889-6600',
  'https://shakeshack.com',
  '["casual", "family-friendly", "outdoor-seating"]'::text[],
  '["ShackBurger", "Crinkle Cut Fries", "Concrete"]'::text[],
  '["Casual Dining", "Quick Bite", "Families"]'::text[],
  8.2, 2145,
  8.0, 8.3, 8.2,
  true, false
),
(
  'Momofuku Noodle Bar',
  '["Asian", "Ramen", "Japanese"]'::jsonb,
  'restaurants',
  '$$',
  '171 1st Ave',
  'New York',
  'NY',
  'East Village',
  ST_SetSRID(ST_MakePoint(-73.9865, 40.7298), 4326)::geography,
  '{"monday": "5:00 PM - 11:00 PM", "tuesday": "5:00 PM - 11:00 PM", "wednesday": "5:00 PM - 11:00 PM", "thursday": "5:00 PM - 11:00 PM", "friday": "5:00 PM - 12:00 AM", "saturday": "11:00 AM - 12:00 AM", "sunday": "11:00 AM - 11:00 PM"}'::jsonb,
  '(212) 777-7773',
  'https://momofuku.com',
  '["trendy", "innovative", "group-friendly"]'::text[],
  '["Pork Buns", "Ramen", "Ginger Scallion Noodles"]'::text[],
  '["Date Night", "Groups", "Casual Dining"]'::text[],
  8.9, 1567,
  9.1, 8.7, 8.9,
  true, true
),
(
  'Blue Bottle Coffee',
  '["Coffee", "Cafe", "Bakery"]'::jsonb,
  'coffee_tea',
  '$$',
  '160 Berry St',
  'New York',
  'NY',
  'Williamsburg',
  ST_SetSRID(ST_MakePoint(-73.9573, 40.7195), 4326)::geography,
  '{"monday": "7:00 AM - 7:00 PM", "tuesday": "7:00 AM - 7:00 PM", "wednesday": "7:00 AM - 7:00 PM", "thursday": "7:00 AM - 7:00 PM", "friday": "7:00 AM - 8:00 PM", "saturday": "8:00 AM - 8:00 PM", "sunday": "8:00 AM - 7:00 PM"}'::jsonb,
  '(510) 653-3394',
  'https://bluebottlecoffee.com',
  '["third-wave-coffee", "minimalist", "work-friendly"]'::text[],
  '["New Orleans Iced Coffee", "Cappuccino", "Pastries"]'::text[],
  '["Working", "Quick Coffee", "Meeting"]'::text[],
  8.4, 987,
  8.6, 8.2, 8.4,
  true, false
);

-- Get restaurant IDs for menu items
DO $$
DECLARE
  joes_id UUID;
  shake_id UUID;
  momofuku_id UUID;
BEGIN
  SELECT id INTO joes_id FROM public.restaurants WHERE name = 'Joe''s Pizza';
  SELECT id INTO shake_id FROM public.restaurants WHERE name = 'Shake Shack';
  SELECT id INTO momofuku_id FROM public.restaurants WHERE name = 'Momofuku Noodle Bar';

  -- ========== Sample Menu Items ==========

  -- Joe's Pizza menu
  INSERT INTO public.menu_items (restaurant_id, name, description, price, category, portion_size, popularity, is_vegetarian, meal_time) VALUES
  (joes_id, 'Plain Cheese Slice', 'Classic NY-style cheese slice', 3.50, 'entree', 'medium', 95, true, '["lunch", "dinner", "any-time"]'::jsonb),
  (joes_id, 'Pepperoni Slice', 'Cheese slice with pepperoni', 4.00, 'entree', 'medium', 98, false, '["lunch", "dinner", "any-time"]'::jsonb),
  (joes_id, 'Sicilian Slice', 'Thick-crust square slice', 4.50, 'entree', 'large', 85, true, '["lunch", "dinner"]'::jsonb);

  -- Shake Shack menu
  INSERT INTO public.menu_items (restaurant_id, name, description, price, category, portion_size, popularity, is_vegetarian, meal_time) VALUES
  (shake_id, 'ShackBurger', 'Cheeseburger with lettuce, tomato, ShackSauce', 6.89, 'entree', 'medium', 97, false, '["lunch", "dinner"]'::jsonb),
  (shake_id, 'Crinkle Cut Fries', 'Crispy crinkle-cut fries', 3.99, 'side', 'medium', 90, true, '["lunch", "dinner", "any-time"]'::jsonb),
  (shake_id, 'Concrete', 'Frozen custard with mix-ins', 5.99, 'dessert', 'medium', 88, true, '["any-time"]'::jsonb);

  -- Momofuku menu
  INSERT INTO public.menu_items (restaurant_id, name, description, price, category, portion_size, popularity, is_vegetarian, spice_level, meal_time) VALUES
  (momofuku_id, 'Pork Buns', 'Steamed buns with braised pork belly', 13.00, 'appetizer', 'shareable', 98, false, 2, '["lunch", "dinner"]'::jsonb),
  (momofuku_id, 'Tonkotsu Ramen', 'Pork broth ramen with chashu, egg', 18.00, 'entree', 'large', 95, false, 3, '["lunch", "dinner"]'::jsonb),
  (momofuku_id, 'Ginger Scallion Noodles', 'Hand-pulled noodles with ginger-scallion sauce', 15.00, 'entree', 'medium', 92, true, 1, '["lunch", "dinner"]'::jsonb);
END $$;

COMMENT ON TABLE public.restaurants IS 'Seeded with 5 NYC restaurants';
COMMENT ON TABLE public.menu_items IS 'Seeded with sample menu items';
