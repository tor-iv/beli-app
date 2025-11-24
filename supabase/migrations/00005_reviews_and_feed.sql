-- Reviews Table
-- User reviews of restaurants

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,

  -- Review Content
  rating NUMERIC(3,1) NOT NULL CHECK (rating >= 0 AND rating <= 10),
  content TEXT NOT NULL,
  photos TEXT[] DEFAULT ARRAY[]::TEXT[], -- S3 URLs
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Engagement
  helpful_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT one_review_per_user_restaurant UNIQUE(user_id, restaurant_id)
);

COMMENT ON TABLE public.reviews IS 'User reviews of restaurants';
COMMENT ON COLUMN public.reviews.helpful_count IS 'Number of users who found this review helpful';

-- Indexes
CREATE INDEX idx_reviews_user ON public.reviews (user_id);
CREATE INDEX idx_reviews_restaurant ON public.reviews (restaurant_id);
CREATE INDEX idx_reviews_rating ON public.reviews (rating DESC);
CREATE INDEX idx_reviews_created_at ON public.reviews (created_at DESC);
CREATE INDEX idx_reviews_helpful ON public.reviews (helpful_count DESC);

-- Full-text search on review content
CREATE INDEX idx_reviews_content ON public.reviews USING gin (to_tsvector('english', content));

-- Update trigger
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Activity Feed Table
-- Records all user activities for the social feed

CREATE TABLE public.feed_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,

  -- Activity Type
  type feed_item_type NOT NULL,

  -- Content
  rating NUMERIC(3,1) CHECK (rating >= 0 AND rating <= 10),
  comment TEXT DEFAULT '',
  photos TEXT[] DEFAULT ARRAY[]::TEXT[], -- S3 URLs
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Visit Details
  companions UUID[], -- User IDs who joined

  -- Engagement (Interactions)
  likes UUID[] DEFAULT ARRAY[]::UUID[], -- User IDs who liked
  bookmarks UUID[] DEFAULT ARRAY[]::UUID[], -- User IDs who bookmarked

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.feed_items IS 'Social activity feed items';
COMMENT ON COLUMN public.feed_items.type IS 'Type of activity: visit, review, recommendation, follow, etc.';
COMMENT ON COLUMN public.feed_items.likes IS 'Array of user IDs who liked this activity';
COMMENT ON COLUMN public.feed_items.bookmarks IS 'Array of user IDs who bookmarked this activity';

-- Indexes
CREATE INDEX idx_feed_user ON public.feed_items (user_id);
CREATE INDEX idx_feed_restaurant ON public.feed_items (restaurant_id);
CREATE INDEX idx_feed_type ON public.feed_items (type);
CREATE INDEX idx_feed_created_at ON public.feed_items (created_at DESC);

-- GIN indexes for array contains queries
CREATE INDEX idx_feed_likes ON public.feed_items USING GIN (likes);
CREATE INDEX idx_feed_bookmarks ON public.feed_items USING GIN (bookmarks);
CREATE INDEX idx_feed_companions ON public.feed_items USING GIN (companions);

-- Update trigger
CREATE TRIGGER update_feed_items_updated_at
  BEFORE UPDATE ON public.feed_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Feed Comments Table
-- Comments on feed items

CREATE TABLE public.feed_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_item_id UUID NOT NULL REFERENCES public.feed_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Comment Content
  content TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.feed_comments IS 'Comments on feed items';

-- Indexes
CREATE INDEX idx_feed_comments_feed_item ON public.feed_comments (feed_item_id, created_at);
CREATE INDEX idx_feed_comments_user ON public.feed_comments (user_id);
CREATE INDEX idx_feed_comments_created_at ON public.feed_comments (created_at DESC);

-- Update trigger
CREATE TRIGGER update_feed_comments_updated_at
  BEFORE UPDATE ON public.feed_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Notifications Table
-- User notifications for various events

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- Recipient
  actor_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Who triggered the notification

  -- Notification Details
  type notification_type NOT NULL,
  action_description TEXT NOT NULL,

  -- Related Entities (optional)
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  feed_item_id UUID REFERENCES public.feed_items(id) ON DELETE CASCADE,
  comment_text TEXT,
  streak_count INTEGER,
  list_name TEXT,

  -- Status
  is_read BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.notifications IS 'User notifications';
COMMENT ON COLUMN public.notifications.action_description IS 'Human-readable action: "liked your rating of", "commented on your review"';

-- Indexes
CREATE INDEX idx_notifications_user ON public.notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications (user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_type ON public.notifications (type);
CREATE INDEX idx_notifications_created_at ON public.notifications (created_at DESC);


-- Function to update review counts and ratings on restaurants
CREATE OR REPLACE FUNCTION public.update_restaurant_ratings()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating NUMERIC(3,1);
  review_count INTEGER;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Calculate new average and count
    SELECT
      ROUND(AVG(rating)::numeric, 1),
      COUNT(*)
    INTO avg_rating, review_count
    FROM public.reviews
    WHERE restaurant_id = NEW.restaurant_id;

    -- Update restaurant
    UPDATE public.restaurants
    SET
      rating = COALESCE(avg_rating, 0),
      rating_count = review_count,
      average_score = COALESCE(avg_rating, 0),
      average_score_sample_size = review_count
    WHERE id = NEW.restaurant_id;

    -- Also update user's total review count
    UPDATE public.users
    SET stats = jsonb_set(
      stats,
      '{totalReviews}',
      to_jsonb((SELECT COUNT(*) FROM public.reviews WHERE user_id = NEW.user_id)::int)
    )
    WHERE id = NEW.user_id;

  ELSIF TG_OP = 'DELETE' THEN
    -- Recalculate after delete
    SELECT
      COALESCE(ROUND(AVG(rating)::numeric, 1), 0),
      COUNT(*)
    INTO avg_rating, review_count
    FROM public.reviews
    WHERE restaurant_id = OLD.restaurant_id;

    UPDATE public.restaurants
    SET
      rating = avg_rating,
      rating_count = review_count,
      average_score = avg_rating,
      average_score_sample_size = review_count
    WHERE id = OLD.restaurant_id;

    -- Update user's total review count
    UPDATE public.users
    SET stats = jsonb_set(
      stats,
      '{totalReviews}',
      to_jsonb((SELECT COUNT(*) FROM public.reviews WHERE user_id = OLD.user_id)::int)
    )
    WHERE id = OLD.user_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurant_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_restaurant_ratings();
