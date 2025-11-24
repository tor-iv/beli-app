-- Tastemaker Posts Table
-- Articles and content from food experts

CREATE TABLE public.tastemaker_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Post Content
  title TEXT NOT NULL,
  subtitle TEXT,
  cover_image TEXT, -- S3 URL
  content TEXT NOT NULL, -- Rich text/markdown

  -- Associated Content
  restaurant_ids UUID[] DEFAULT ARRAY[]::UUID[],
  list_ids UUID[] DEFAULT ARRAY[]::UUID[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Engagement
  likes UUID[] DEFAULT ARRAY[]::UUID[], -- User IDs who liked
  bookmarks UUID[] DEFAULT ARRAY[]::UUID[], -- User IDs who bookmarked
  views INTEGER DEFAULT 0,

  -- Status
  is_featured BOOLEAN DEFAULT false,

  -- Timestamps
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.tastemaker_posts IS 'Content published by tastemakers (food experts)';

-- Indexes
CREATE INDEX idx_tastemaker_posts_user ON public.tastemaker_posts (user_id);
CREATE INDEX idx_tastemaker_posts_is_featured ON public.tastemaker_posts (is_featured, published_at DESC) WHERE is_featured = true;
CREATE INDEX idx_tastemaker_posts_published ON public.tastemaker_posts (published_at DESC);

-- GIN indexes
CREATE INDEX idx_tastemaker_posts_restaurant_ids ON public.tastemaker_posts USING GIN (restaurant_ids);
CREATE INDEX idx_tastemaker_posts_tags ON public.tastemaker_posts USING GIN (tags);
CREATE INDEX idx_tastemaker_posts_likes ON public.tastemaker_posts USING GIN (likes);
CREATE INDEX idx_tastemaker_posts_bookmarks ON public.tastemaker_posts USING GIN (bookmarks);

-- Full-text search
CREATE INDEX idx_tastemaker_posts_title ON public.tastemaker_posts USING gin (to_tsvector('english', title));
CREATE INDEX idx_tastemaker_posts_content ON public.tastemaker_posts USING gin (to_tsvector('english', content));

-- Update trigger
CREATE TRIGGER update_tastemaker_posts_updated_at
  BEFORE UPDATE ON public.tastemaker_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Reservations Table
-- Reservation sharing feature

CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- Original owner

  -- Reservation Details
  date_time TIMESTAMPTZ NOT NULL,
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  notes TEXT,

  -- Status
  status reservation_status DEFAULT 'available',
  claimed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  shared_with UUID[], -- User IDs reservation is shared with

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.reservations IS 'Restaurant reservations (shareable feature)';

-- Indexes
CREATE INDEX idx_reservations_restaurant ON public.reservations (restaurant_id, date_time);
CREATE INDEX idx_reservations_user ON public.reservations (user_id);
CREATE INDEX idx_reservations_status ON public.reservations (status);
CREATE INDEX idx_reservations_date_time ON public.reservations (date_time);
CREATE INDEX idx_reservations_claimed_by ON public.reservations (claimed_by) WHERE claimed_by IS NOT NULL;

-- Update trigger
CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Group Dinner Sessions Table
-- Tracks group dining sessions and matches

CREATE TABLE public.group_dinner_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Participants
  participant_ids UUID[] DEFAULT ARRAY[]::UUID[], -- Can be empty for solo

  -- Match Result
  selected_restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.group_dinner_sessions IS 'Group dining coordination sessions';

-- Indexes
CREATE INDEX idx_group_dinner_user ON public.group_dinner_sessions (user_id);
CREATE INDEX idx_group_dinner_created_at ON public.group_dinner_sessions (created_at DESC);

-- Update trigger
CREATE TRIGGER update_group_dinner_sessions_updated_at
  BEFORE UPDATE ON public.group_dinner_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Search History Table
-- Track user search queries

CREATE TABLE public.search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Search Details
  query TEXT NOT NULL,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE, -- If they clicked a result

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.search_history IS 'User search history for recent searches feature';

-- Indexes
CREATE INDEX idx_search_history_user ON public.search_history (user_id, created_at DESC);
CREATE INDEX idx_search_history_restaurant ON public.search_history (restaurant_id) WHERE restaurant_id IS NOT NULL;


-- Challenge Goals Table
-- Annual restaurant challenge tracking (e.g., visit 50 new restaurants in 2025)

CREATE TABLE public.challenge_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Challenge Details
  year INTEGER NOT NULL,
  goal_count INTEGER NOT NULL CHECK (goal_count > 0),
  current_count INTEGER DEFAULT 0 CHECK (current_count >= 0),

  -- Dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, year)
);

COMMENT ON TABLE public.challenge_goals IS 'User annual restaurant challenge goals';

-- Indexes
CREATE INDEX idx_challenge_goals_user ON public.challenge_goals (user_id);
CREATE INDEX idx_challenge_goals_year ON public.challenge_goals (year);

-- Update trigger
CREATE TRIGGER update_challenge_goals_updated_at
  BEFORE UPDATE ON public.challenge_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
