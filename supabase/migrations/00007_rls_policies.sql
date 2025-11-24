-- Row Level Security (RLS) Policies
-- Database-level security that can't be bypassed

-- ========== Users Table ==========
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Anyone can view public profiles
CREATE POLICY "Public profiles are viewable"
ON public.users FOR SELECT
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- Users can insert their own profile (via trigger, but allow manual too)
CREATE POLICY "Users can insert own profile"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);


-- ========== Restaurants Table ==========
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Anyone can view restaurants (public data)
CREATE POLICY "Restaurants are viewable by everyone"
ON public.restaurants FOR SELECT
USING (true);

-- Only authenticated users can create restaurants (could add admin check later)
CREATE POLICY "Authenticated users can create restaurants"
ON public.restaurants FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update restaurants (could add admin check later)
CREATE POLICY "Authenticated users can update restaurants"
ON public.restaurants FOR UPDATE
TO authenticated
USING (true);


-- ========== Menu Items Table ==========
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view menu items
CREATE POLICY "Menu items are viewable by everyone"
ON public.menu_items FOR SELECT
USING (true);

-- Authenticated users can create menu items
CREATE POLICY "Authenticated users can create menu items"
ON public.menu_items FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update menu items
CREATE POLICY "Authenticated users can update menu items"
ON public.menu_items FOR UPDATE
TO authenticated
USING (true);


-- ========== User Follows Table ==========
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Users can view all follows (for social graph)
CREATE POLICY "Follows are viewable by everyone"
ON public.user_follows FOR SELECT
USING (true);

-- Users can follow others (create their own follow relationships)
CREATE POLICY "Users can create follows"
ON public.user_follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow (delete their own follow relationships)
CREATE POLICY "Users can delete own follows"
ON public.user_follows FOR DELETE
USING (auth.uid() = follower_id);


-- ========== User Restaurant Relations Table ==========
ALTER TABLE public.user_restaurant_relations ENABLE ROW LEVEL SECURITY;

-- Users can view their own relations and public ones
CREATE POLICY "Users can view own relations"
ON public.user_restaurant_relations FOR SELECT
USING (auth.uid() = user_id OR user_id IN (
  SELECT id FROM public.users WHERE true -- Could add privacy settings later
));

-- Users can create their own relations
CREATE POLICY "Users can create own relations"
ON public.user_restaurant_relations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own relations
CREATE POLICY "Users can update own relations"
ON public.user_restaurant_relations FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own relations
CREATE POLICY "Users can delete own relations"
ON public.user_restaurant_relations FOR DELETE
USING (auth.uid() = user_id);


-- ========== Lists Table ==========
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

-- Users can view public lists and their own private lists
CREATE POLICY "Users can view public lists and own lists"
ON public.lists FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

-- Users can create their own lists
CREATE POLICY "Users can create own lists"
ON public.lists FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own lists
CREATE POLICY "Users can update own lists"
ON public.lists FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own lists
CREATE POLICY "Users can delete own lists"
ON public.lists FOR DELETE
USING (auth.uid() = user_id);


-- ========== Reviews Table ==========
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Reviews are viewable by everyone"
ON public.reviews FOR SELECT
USING (true);

-- Users can create their own reviews
CREATE POLICY "Users can create own reviews"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
ON public.reviews FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
ON public.reviews FOR DELETE
USING (auth.uid() = user_id);


-- ========== Feed Items Table ==========
ALTER TABLE public.feed_items ENABLE ROW LEVEL SECURITY;

-- Users can view feed items from people they follow (or public feed)
CREATE POLICY "Users can view public feed"
ON public.feed_items FOR SELECT
USING (
  -- Own feed items
  auth.uid() = user_id
  OR
  -- Feed items from people user follows
  user_id IN (
    SELECT following_id
    FROM public.user_follows
    WHERE follower_id = auth.uid()
  )
  OR
  -- Public feed items (everyone can see)
  true -- For now, all feed items are public; can add privacy later
);

-- Users can create their own feed items
CREATE POLICY "Users can create own feed items"
ON public.feed_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own feed items
CREATE POLICY "Users can update own feed items"
ON public.feed_items FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own feed items
CREATE POLICY "Users can delete own feed items"
ON public.feed_items FOR DELETE
USING (auth.uid() = user_id);


-- ========== Feed Comments Table ==========
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments
CREATE POLICY "Comments are viewable by everyone"
ON public.feed_comments FOR SELECT
USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
ON public.feed_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
ON public.feed_comments FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
ON public.feed_comments FOR DELETE
USING (auth.uid() = user_id);


-- ========== Notifications Table ==========
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications only
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

-- System can insert notifications (allow authenticated for now, refine later)
CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);


-- ========== Tastemaker Posts Table ==========
ALTER TABLE public.tastemaker_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view published posts
CREATE POLICY "Published posts are viewable by everyone"
ON public.tastemaker_posts FOR SELECT
USING (true);

-- Tastemakers can create posts
CREATE POLICY "Tastemakers can create posts"
ON public.tastemaker_posts FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND
  (SELECT is_tastemaker FROM public.users WHERE id = auth.uid()) = true
);

-- Tastemakers can update their own posts
CREATE POLICY "Tastemakers can update own posts"
ON public.tastemaker_posts FOR UPDATE
USING (auth.uid() = user_id);

-- Tastemakers can delete their own posts
CREATE POLICY "Tastemakers can delete own posts"
ON public.tastemaker_posts FOR DELETE
USING (auth.uid() = user_id);


-- ========== Reservations Table ==========
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Users can view their own reservations and ones shared with them
CREATE POLICY "Users can view own and shared reservations"
ON public.reservations FOR SELECT
USING (
  auth.uid() = user_id
  OR auth.uid() = claimed_by
  OR auth.uid() = ANY(shared_with)
);

-- Users can create their own reservations
CREATE POLICY "Users can create own reservations"
ON public.reservations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reservations
CREATE POLICY "Users can update own reservations"
ON public.reservations FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own reservations
CREATE POLICY "Users can delete own reservations"
ON public.reservations FOR DELETE
USING (auth.uid() = user_id);


-- ========== Group Dinner Sessions Table ==========
ALTER TABLE public.group_dinner_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view own group dinner sessions"
ON public.group_dinner_sessions FOR SELECT
USING (
  auth.uid() = user_id
  OR auth.uid() = ANY(participant_ids)
);

-- Users can create sessions
CREATE POLICY "Users can create group dinner sessions"
ON public.group_dinner_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
ON public.group_dinner_sessions FOR UPDATE
USING (auth.uid() = user_id);


-- ========== Search History Table ==========
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own search history only
CREATE POLICY "Users can view own search history"
ON public.search_history FOR SELECT
USING (auth.uid() = user_id);

-- Users can create search history
CREATE POLICY "Users can create search history"
ON public.search_history FOR INSERT
WITH CHECK (auth.uid() = user_id);


-- ========== Challenge Goals Table ==========
ALTER TABLE public.challenge_goals ENABLE ROW LEVEL SECURITY;

-- Users can view public challenges and their own
CREATE POLICY "Users can view public and own challenges"
ON public.challenge_goals FOR SELECT
USING (auth.uid() = user_id OR true); -- All challenges viewable for leaderboard

-- Users can create their own challenges
CREATE POLICY "Users can create own challenges"
ON public.challenge_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own challenges
CREATE POLICY "Users can update own challenges"
ON public.challenge_goals FOR UPDATE
USING (auth.uid() = user_id);

COMMENT ON SCHEMA public IS 'Row Level Security enabled for all tables. Database enforces permissions.';
