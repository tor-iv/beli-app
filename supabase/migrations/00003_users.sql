-- User Profiles Table
-- Extends Supabase auth.users with custom profile data

CREATE TABLE public.users (
  -- Identity (matches auth.users.id)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Profile
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar TEXT, -- S3 URL or Supabase Storage path
  bio TEXT DEFAULT '',

  -- Location
  city TEXT,
  state TEXT,

  -- Preferences
  dietary_restrictions TEXT[] DEFAULT ARRAY[]::TEXT[],
  disliked_cuisines TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Stats (denormalized for performance)
  stats JSONB DEFAULT '{
    "followers": 0,
    "following": 0,
    "rank": 0,
    "beenCount": 0,
    "wantToTryCount": 0,
    "currentStreak": 0,
    "totalReviews": 0
  }'::jsonb,

  -- Tastemaker Status
  is_tastemaker BOOLEAN DEFAULT false,
  tastemaker_profile JSONB, -- {specialty, tagline, badges, etc}

  -- Timestamps
  member_since TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$') -- Alphanumeric + underscore only
);

COMMENT ON TABLE public.users IS 'User profiles extending auth.users';
COMMENT ON COLUMN public.users.id IS 'Foreign key to auth.users.id (auto-managed by Supabase)';
COMMENT ON COLUMN public.users.stats IS 'User statistics (denormalized for performance)';
COMMENT ON COLUMN public.users.tastemaker_profile IS 'Extended tastemaker data (specialty, badges, social links)';

-- Indexes
CREATE INDEX idx_users_username ON public.users (username);
CREATE INDEX idx_users_is_tastemaker ON public.users (is_tastemaker) WHERE is_tastemaker = true;
CREATE INDEX idx_users_city ON public.users (city);
CREATE INDEX idx_users_created_at ON public.users (created_at DESC);

-- GIN index for stats JSONB (for querying within stats)
CREATE INDEX idx_users_stats ON public.users USING GIN (stats);


-- Social Relationships Table (Followers/Following)
CREATE TABLE public.user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id) -- Can't follow yourself
);

COMMENT ON TABLE public.user_follows IS 'Social follow relationships';

-- Indexes
CREATE INDEX idx_user_follows_follower ON public.user_follows (follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows (following_id);
CREATE INDEX idx_user_follows_created_at ON public.user_follows (created_at DESC);


-- Function to auto-create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  random_suffix TEXT;
  base_username TEXT;
  final_username TEXT;
  attempt INTEGER := 0;
BEGIN
  -- Extract base username from email (before @)
  base_username := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9_]', '', 'g'));

  -- Ensure minimum length
  IF LENGTH(base_username) < 3 THEN
    base_username := 'user';
  END IF;

  -- Try to create unique username
  LOOP
    IF attempt = 0 THEN
      final_username := base_username;
    ELSE
      -- Add random suffix if username taken
      random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
      final_username := base_username || '_' || random_suffix;
    END IF;

    -- Try to insert user profile
    BEGIN
      INSERT INTO public.users (
        id,
        username,
        display_name,
        avatar
      ) VALUES (
        NEW.id,
        final_username,
        COALESCE(NEW.raw_user_meta_data->>'display_name', final_username),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
      );
      EXIT; -- Success, exit loop
    EXCEPTION WHEN unique_violation THEN
      attempt := attempt + 1;
      IF attempt > 10 THEN
        RAISE EXCEPTION 'Could not generate unique username after 10 attempts';
      END IF;
    END;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates user profile when auth user signs up';


-- Function to update follower/following counts
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment follower count for person being followed
    UPDATE public.users
    SET stats = jsonb_set(
      stats,
      '{followers}',
      to_jsonb((COALESCE((stats->>'followers')::int, 0) + 1)::int)
    )
    WHERE id = NEW.following_id;

    -- Increment following count for person doing the following
    UPDATE public.users
    SET stats = jsonb_set(
      stats,
      '{following}',
      to_jsonb((COALESCE((stats->>'following')::int, 0) + 1)::int)
    )
    WHERE id = NEW.follower_id;

  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement follower count
    UPDATE public.users
    SET stats = jsonb_set(
      stats,
      '{followers}',
      to_jsonb(GREATEST((COALESCE((stats->>'followers')::int, 0) - 1), 0)::int)
    )
    WHERE id = OLD.following_id;

    -- Decrement following count
    UPDATE public.users
    SET stats = jsonb_set(
      stats,
      '{following}',
      to_jsonb(GREATEST((COALESCE((stats->>'following')::int, 0) - 1), 0)::int)
    )
    WHERE id = OLD.follower_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_follow_counts_trigger
  AFTER INSERT OR DELETE ON public.user_follows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_follow_counts();

-- Update trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
