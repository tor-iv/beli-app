-- User-Restaurant Relationships
-- Tracks been/want-to-try/recommended status for each user-restaurant pair

CREATE TABLE public.user_restaurant_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,

  -- Relationship Type
  status user_restaurant_status NOT NULL,

  -- Rating & Notes
  rating NUMERIC(3,1) CHECK (rating >= 0 AND rating <= 10),
  rank_index INTEGER, -- Position in user's ranked list (0 = highest)
  notes TEXT,
  photos TEXT[] DEFAULT ARRAY[]::TEXT[], -- S3 URLs
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Visit Details
  visit_date DATE,
  companions UUID[], -- Array of user IDs

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, restaurant_id, status) -- User can have only one of each status per restaurant
);

COMMENT ON TABLE public.user_restaurant_relations IS 'Tracks user-restaurant relationships (been, want-to-try, recommended)';
COMMENT ON COLUMN public.user_restaurant_relations.rank_index IS 'Position in ranked list within category (0 = highest rank)';
COMMENT ON COLUMN public.user_restaurant_relations.companions IS 'Array of user IDs who joined this visit';

-- Indexes
CREATE INDEX idx_urr_user ON public.user_restaurant_relations (user_id);
CREATE INDEX idx_urr_restaurant ON public.user_restaurant_relations (restaurant_id);
CREATE INDEX idx_urr_status ON public.user_restaurant_relations (status);
CREATE INDEX idx_urr_user_status ON public.user_restaurant_relations (user_id, status);
CREATE INDEX idx_urr_created_at ON public.user_restaurant_relations (created_at DESC);
CREATE INDEX idx_urr_visit_date ON public.user_restaurant_relations (visit_date DESC) WHERE visit_date IS NOT NULL;

-- Update trigger
CREATE TRIGGER update_urr_updated_at
  BEFORE UPDATE ON public.user_restaurant_relations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Lists Table
-- User-created lists (custom collections of restaurants)

CREATE TABLE public.lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- List Details
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category list_category DEFAULT 'restaurants',
  list_type list_scope DEFAULT 'playlists',

  -- Restaurants (array of IDs)
  restaurant_ids UUID[] DEFAULT ARRAY[]::UUID[],

  -- Settings
  is_public BOOLEAN DEFAULT true,
  thumbnail_image TEXT, -- S3 URL for featured lists

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.lists IS 'User-created restaurant lists';
COMMENT ON COLUMN public.lists.restaurant_ids IS 'Array of restaurant IDs in this list';

-- Indexes
CREATE INDEX idx_lists_user ON public.lists (user_id);
CREATE INDEX idx_lists_category ON public.lists (category);
CREATE INDEX idx_lists_list_type ON public.lists (list_type);
CREATE INDEX idx_lists_is_public ON public.lists (is_public) WHERE is_public = true;
CREATE INDEX idx_lists_created_at ON public.lists (created_at DESC);

-- GIN index for array contains queries
CREATE INDEX idx_lists_restaurant_ids ON public.lists USING GIN (restaurant_ids);

-- Update trigger
CREATE TRIGGER update_lists_updated_at
  BEFORE UPDATE ON public.lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Function to update user stats when relations change
CREATE OR REPLACE FUNCTION public.update_user_restaurant_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment the appropriate count based on status
    IF NEW.status = 'been' THEN
      UPDATE public.users
      SET stats = jsonb_set(
        stats,
        '{beenCount}',
        to_jsonb((COALESCE((stats->>'beenCount')::int, 0) + 1)::int)
      )
      WHERE id = NEW.user_id;
    ELSIF NEW.status = 'want_to_try' THEN
      UPDATE public.users
      SET stats = jsonb_set(
        stats,
        '{wantToTryCount}',
        to_jsonb((COALESCE((stats->>'wantToTryCount')::int, 0) + 1)::int)
      )
      WHERE id = NEW.user_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement the appropriate count
    IF OLD.status = 'been' THEN
      UPDATE public.users
      SET stats = jsonb_set(
        stats,
        '{beenCount}',
        to_jsonb(GREATEST((COALESCE((stats->>'beenCount')::int, 0) - 1), 0)::int)
      )
      WHERE id = OLD.user_id;
    ELSIF OLD.status = 'want_to_try' THEN
      UPDATE public.users
      SET stats = jsonb_set(
        stats,
        '{wantToTryCount}',
        to_jsonb(GREATEST((COALESCE((stats->>'wantToTryCount')::int, 0) - 1), 0)::int)
      )
      WHERE id = OLD.user_id;
    END IF;

  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Status changed, decrement old, increment new
    IF OLD.status = 'been' THEN
      UPDATE public.users
      SET stats = jsonb_set(
        stats,
        '{beenCount}',
        to_jsonb(GREATEST((COALESCE((stats->>'beenCount')::int, 0) - 1), 0)::int)
      )
      WHERE id = NEW.user_id;
    ELSIF OLD.status = 'want_to_try' THEN
      UPDATE public.users
      SET stats = jsonb_set(
        stats,
        '{wantToTryCount}',
        to_jsonb(GREATEST((COALESCE((stats->>'wantToTryCount')::int, 0) - 1), 0)::int)
      )
      WHERE id = NEW.user_id;
    END IF;

    IF NEW.status = 'been' THEN
      UPDATE public.users
      SET stats = jsonb_set(
        stats,
        '{beenCount}',
        to_jsonb((COALESCE((stats->>'beenCount')::int, 0) + 1)::int)
      )
      WHERE id = NEW.user_id;
    ELSIF NEW.status = 'want_to_try' THEN
      UPDATE public.users
      SET stats = jsonb_set(
        stats,
        '{wantToTryCount}',
        to_jsonb((COALESCE((stats->>'wantToTryCount')::int, 0) + 1)::int)
      )
      WHERE id = NEW.user_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_restaurant_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_restaurant_relations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_restaurant_stats();
