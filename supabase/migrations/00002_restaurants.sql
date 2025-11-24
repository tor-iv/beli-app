-- Restaurants Table
-- Core restaurant data with embedded location (denormalized for performance)

CREATE TABLE public.restaurants (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Information
  name TEXT NOT NULL,
  cuisine JSONB DEFAULT '[]'::jsonb, -- Array of cuisine types
  category list_category DEFAULT 'restaurants',
  price_range TEXT CHECK (price_range IN ('$', '$$', '$$$', '$$$$')) DEFAULT '$$',

  -- Location (Embedded - No separate table for performance)
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  coordinates GEOGRAPHY(POINT, 4326) NOT NULL, -- PostGIS Point (lat/lng)

  -- Operating Hours (JSON for flexibility)
  hours JSONB DEFAULT '{}'::jsonb,
  -- Example: {"monday": "11:00 AM - 10:00 PM", "tuesday": "Closed"}

  -- Contact
  phone TEXT,
  website TEXT,

  -- Media (S3 URLs)
  images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
  popular_dish_images JSONB DEFAULT '[]'::jsonb, -- Array of dish photo URLs

  -- Metadata
  tags JSONB DEFAULT '[]'::jsonb, -- Array of tags
  popular_dishes JSONB DEFAULT '[]'::jsonb, -- Array of dish names
  good_for JSONB DEFAULT '[]'::jsonb, -- Array of occasions

  -- Status
  is_open BOOLEAN DEFAULT true,
  accepts_reservations BOOLEAN DEFAULT false,

  -- Ratings & Scores (Denormalized for performance)
  rating NUMERIC(3,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 10),
  rating_count INTEGER DEFAULT 0,

  -- Beli's triple-score system
  rec_score NUMERIC(3,1) CHECK (rec_score >= 0 AND rec_score <= 10),
  rec_score_sample_size INTEGER DEFAULT 0,
  friend_score NUMERIC(3,1) CHECK (friend_score >= 0 AND friend_score <= 10),
  friend_score_sample_size INTEGER DEFAULT 0,
  average_score NUMERIC(3,1) CHECK (average_score >= 0 AND average_score <= 10),
  average_score_sample_size INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments for documentation
COMMENT ON TABLE public.restaurants IS 'Core restaurant data with embedded location (fat model design)';
COMMENT ON COLUMN public.restaurants.coordinates IS 'PostGIS geography point (SRID 4326) for geospatial queries';
COMMENT ON COLUMN public.restaurants.hours IS 'Operating hours as JSON: {"monday": "11:00 AM - 10:00 PM"}';
COMMENT ON COLUMN public.restaurants.rating IS 'Overall rating (0.0-10.0)';
COMMENT ON COLUMN public.restaurants.rec_score IS 'Score from critics/tastemakers';
COMMENT ON COLUMN public.restaurants.friend_score IS 'Score from user''s friends';
COMMENT ON COLUMN public.restaurants.average_score IS 'Overall average from all users';

-- Indexes for performance (same strategy as Django model)
CREATE INDEX idx_restaurants_name ON public.restaurants USING gin (name gin_trgm_ops); -- Fuzzy text search
CREATE INDEX idx_restaurants_city ON public.restaurants (city);
CREATE INDEX idx_restaurants_neighborhood ON public.restaurants (neighborhood);
CREATE INDEX idx_restaurants_category ON public.restaurants (category);
CREATE INDEX idx_restaurants_price_range ON public.restaurants (price_range);
CREATE INDEX idx_restaurants_is_open ON public.restaurants (is_open);
CREATE INDEX idx_restaurants_rating ON public.restaurants (rating DESC);
CREATE INDEX idx_restaurants_created_at ON public.restaurants (created_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX idx_restaurants_city_rating ON public.restaurants (city, rating DESC);
CREATE INDEX idx_restaurants_neighborhood_rating ON public.restaurants (neighborhood, rating DESC);

-- PostGIS spatial index (GIST) for geospatial queries
CREATE INDEX idx_restaurants_coordinates ON public.restaurants USING GIST (coordinates);

-- GIN index for JSON fields (cuisine search)
CREATE INDEX idx_restaurants_cuisine ON public.restaurants USING GIN (cuisine);
CREATE INDEX idx_restaurants_tags ON public.restaurants USING GIN (tags);


-- Menu Items Table
-- Separate table because menus are complex entities with many items per restaurant

CREATE TABLE public.menu_items (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,

  -- Basic Information
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category menu_item_category NOT NULL,

  -- Media
  image_url TEXT,

  -- Portion & Metadata
  portion_size portion_size DEFAULT 'medium',
  tags JSONB DEFAULT '[]'::jsonb,
  popularity INTEGER DEFAULT 0 CHECK (popularity >= 0 AND popularity <= 100),

  -- Dietary Information
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  spice_level INTEGER CHECK (spice_level >= 1 AND spice_level <= 5),

  -- Meal Times
  meal_time JSONB DEFAULT '[]'::jsonb, -- ["breakfast", "lunch", "dinner", "any-time"]

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.menu_items IS 'Restaurant menu items (separate table due to complexity)';
COMMENT ON COLUMN public.menu_items.popularity IS 'Popularity score (0-100)';
COMMENT ON COLUMN public.menu_items.spice_level IS 'Spice level (1-5, nullable)';

-- Indexes
CREATE INDEX idx_menu_items_restaurant ON public.menu_items (restaurant_id);
CREATE INDEX idx_menu_items_category ON public.menu_items (category);
CREATE INDEX idx_menu_items_name ON public.menu_items USING gin (name gin_trgm_ops);
CREATE INDEX idx_menu_items_popularity ON public.menu_items (restaurant_id, popularity DESC);
CREATE INDEX idx_menu_items_vegetarian ON public.menu_items (is_vegetarian) WHERE is_vegetarian = true;
CREATE INDEX idx_menu_items_vegan ON public.menu_items (is_vegan) WHERE is_vegan = true;
CREATE INDEX idx_menu_items_gluten_free ON public.menu_items (is_gluten_free) WHERE is_gluten_free = true;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
