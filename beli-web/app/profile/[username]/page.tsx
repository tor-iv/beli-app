'use client';

import { useState, useMemo, useCallback } from 'react';
import { CuisineBreakdown, CityBreakdown, CountryBreakdown } from '@/types';
import { notFound, useRouter, useParams } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileListRow } from '@/components/profile/profile-list-row';
import { ProfileStatCard } from '@/components/profile/profile-stat-card';
import { AchievementBanner } from '@/components/profile/achievement-banner';
import { ProfileActivityCard } from '@/components/profile/profile-activity-card';
import { TasteProfileSummaryCard } from '@/components/profile/taste-profile-summary-card';
import { TasteProfileCategoryTabs, TasteProfileCategory } from '@/components/profile/taste-profile-category-tabs';
import { TasteProfileList, SortOption } from '@/components/profile/taste-profile-list';
import { DiningMap } from '@/components/profile/dining-map';
import { useTasteProfile } from '@/lib/hooks/use-taste-profile';
import { useUserByUsername, useCurrentUser, useUserReviews, useIsFollowing, useFollowUser, useUnfollowUser } from '@/lib/hooks/use-user';
import { useRestaurantsByIds } from '@/lib/hooks/use-restaurants';
import { Instagram, Newspaper, BarChart3 } from 'lucide-react';
import { COLORS } from '@/lib/theme/colors';

// Constants
const TASTE_PROFILE_DAYS = 30;
const MAX_RECENT_REVIEWS = 5;
const ACHIEVEMENT_PROGRESS_COMPLETE = 1; // 100% completion
const SUPER_CLUB_BADGE = 'SC'; // "Super Club" membership badge

// Pure functions outside component scope
const formatMemberSince = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params?.username as string;
  const [activeTab, setActiveTab] = useState<'activity' | 'taste'>('activity');

  // Taste profile state
  const [tasteCategory, setTasteCategory] = useState<TasteProfileCategory>('cuisines');
  const [sortBy, setSortBy] = useState<SortOption>('count');

  // Load user data using React Query
  const { data: user, isLoading: userLoading } = useUserByUsername(username);
  const { data: currentUser } = useCurrentUser();
  const { data: reviews = [] } = useUserReviews(user?.id || '');

  // Check if current user is viewing own profile
  const isCurrentUser = useMemo(() => {
    return user?.id === currentUser?.id;
  }, [user?.id, currentUser?.id]);

  // Load following status - hook is always called but enabled option handles gating
  const { data: isFollowingData } = useIsFollowing(
    currentUser?.id || '',
    user?.id || '',
  );

  // Follow/unfollow mutations using the new hooks
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  // Only load restaurants needed for reviews (not all 53!)
  const reviewRestaurantIds = useMemo(() => {
    return reviews.slice(0, MAX_RECENT_REVIEWS).map(r => r.restaurantId);
  }, [reviews]);

  const { data: restaurants = [] } = useRestaurantsByIds(reviewRestaurantIds);

  // Load taste profile data only when taste tab is active
  const { data: tasteProfile, isLoading: tasteProfileLoading } = useTasteProfile(
    user?.id || '',
    TASTE_PROFILE_DAYS,
    activeTab === 'taste'
  );

  // OPTIMIZED: Memoized function to get current category data for taste profile
  const getCurrentCategoryData = useMemo(() => {
    if (!tasteProfile) return [];

    let data: Array<CuisineBreakdown | CityBreakdown | CountryBreakdown> = [];

    switch (tasteCategory) {
      case 'cuisines':
        data = tasteProfile.cuisineBreakdown;
        break;
      case 'cities':
        data = tasteProfile.cityBreakdown;
        break;
      case 'countries':
        data = tasteProfile.countryBreakdown;
        break;
    }

    // Sort data
    return [...data].sort((a, b) => {
      if (sortBy === 'count') {
        return b.count - a.count;
      } else {
        return b.avgScore - a.avgScore;
      }
    });
  }, [tasteProfile, tasteCategory, sortBy]);

  // Recent reviews for display (first 5)
  const recentReviews = useMemo(() => reviews.slice(0, MAX_RECENT_REVIEWS), [reviews]);

  // OPTIMIZED: Pre-compute review-restaurant pairs to avoid O(n²) lookup in render
  const reviewsWithRestaurants = useMemo(() => {
    // Create a Map for O(1) restaurant lookup instead of O(n) find()
    const restaurantMap = new Map(restaurants.map(r => [r.id, r]));

    return recentReviews
      .map(review => ({
        review,
        restaurant: restaurantMap.get(review.restaurantId)
      }))
      .filter(item => item.restaurant !== undefined) as Array<{
        review: typeof recentReviews[0];
        restaurant: NonNullable<typeof restaurants[0]>;
      }>;
  }, [recentReviews, restaurants]);

  // Event handlers wrapped in useCallback for performance
  // IMPORTANT: These must be called BEFORE early returns to maintain consistent hook order
  const handleSortToggle = useCallback(() => {
    setSortBy(prev => prev === 'count' ? 'avgScore' : 'count');
  }, []);

  const handleItemPress = useCallback((item: CuisineBreakdown | CityBreakdown | CountryBreakdown) => {
    // In a real app, this would navigate to a filtered restaurant list
    // TODO: Navigate to filtered restaurant list based on selected item
    router.push(`/search?filter=${JSON.stringify(item)}`);
  }, [router]);

  const handleShare = useCallback(() => {
    // In a real app, this would trigger native share functionality
    // TODO: Implement native share API or copy-to-clipboard
    if (!user) return;

    if (navigator.share) {
      navigator.share({
        title: `${user.displayName}'s Taste Profile`,
        url: window.location.href,
      });
    }
  }, [user]);

  const handleFollowToggle = useCallback(async () => {
    if (!currentUser || !user) return;

    if (isFollowingData) {
      unfollowMutation.mutate({ userId: currentUser.id, targetUserId: user.id });
    } else {
      followMutation.mutate({ userId: currentUser.id, targetUserId: user.id });
    }
  }, [currentUser, user, isFollowingData, followMutation, unfollowMutation]);

  const handleSetNewGoal = useCallback(() => {
    // TODO: Implement goal setting functionality
    router.push('/challenge');
  }, [router]);

  // Loading state - early return AFTER all hooks are called
  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  // User not found - early return AFTER all hooks are called
  if (!user) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto max-w-3xl">
        {/* Header with Name */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">{user.displayName}</h1>
        </div>

        {/* Profile Info Section */}
        <div className="bg-white px-6 pb-8 border-b border-gray-200">
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <div className="mt-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar} alt={user.displayName} />
                <AvatarFallback className="text-2xl">{user.displayName[0]}</AvatarFallback>
              </Avatar>
            </div>

            {/* Username and Badge */}
            <div className="flex items-center gap-2 mt-4">
              <span className="text-lg font-semibold text-gray-900">@{user.username}</span>
              <span className="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded">
                {SUPER_CLUB_BADGE}
              </span>
            </div>
            <p className="text-base text-gray-700 mt-1">
              Member since {formatMemberSince(user.memberSince)}
            </p>

            {/* Bio */}
            {user.bio && (
              <p className="text-base text-gray-900 text-center mt-3 leading-6 max-w-md">
                {user.bio}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4 w-full max-w-md">
              {isCurrentUser ? (
                <>
                  <Button variant="outline" className="flex-1">
                    Edit profile
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Share profile
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant={isFollowingData ? "outline" : "default"}
                    className="flex-1"
                    onClick={handleFollowToggle}
                    disabled={followMutation.isPending || unfollowMutation.isPending}
                  >
                    {(followMutation.isPending || unfollowMutation.isPending) ? 'Loading...' : isFollowingData ? 'Following' : 'Follow'}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Share profile
                  </Button>
                </>
              )}
            </div>

            {/* Instagram Link */}
            <button className="mt-3 w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <Instagram className="w-6 h-6 text-gray-900" />
            </button>

            {/* Stats Row */}
            <div className="flex justify-around w-full max-w-md mt-8">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{user.stats.followers}</div>
                <div className="text-sm text-gray-700 mt-1">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{user.stats.following}</div>
                <div className="text-sm text-gray-700 mt-1">Following</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">#{user.stats.rank}</div>
                <div className="text-sm text-gray-700 mt-1">Rank on Beli</div>
              </div>
            </div>
          </div>
        </div>

        {/* List Rows */}
        <div className="bg-white mt-3">
          <ProfileListRow
            icon="check"
            label="Been"
            count={user.stats.beenCount}
            onPress={() => router.push('/lists?tab=been')}
            isLast={false}
          />
          <ProfileListRow
            icon="bookmark"
            label="Want to Try"
            count={user.stats.wantToTryCount}
            onPress={() => router.push('/lists?tab=want_to_try')}
            isLast={false}
          />
          <ProfileListRow
            icon="heart"
            label="Recs for You"
            onPress={() => router.push('/lists?tab=recs')}
            isLast={true}
          />
        </div>

        {/* Stat Cards */}
        <div className="flex gap-3 px-4 mt-4">
          <ProfileStatCard
            icon="trophy"
            label="Rank on Beli"
            value={`#${user.stats.rank}`}
            iconColor={COLORS.primary}
          />
          <ProfileStatCard
            icon="flame"
            label="Current Streak"
            value={`${user.stats.currentStreak} weeks`}
            iconColor={COLORS.accent.streak}
          />
        </div>

        {/* Achievement Banner */}
        <div className="px-4 mt-4">
          <AchievementBanner
            emoji="🎉"
            text="Congrats! You reached your 2025 goal!"
            progress={ACHIEVEMENT_PROGRESS_COMPLETE}
            daysLeft={Math.ceil((new Date(new Date().getFullYear(), 11, 31).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} // Days remaining in current year
            onSetNewGoal={handleSetNewGoal}
          />
        </div>

        {/* Tabs */}
        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'activity' | 'taste')}>
            <TabsList className="w-full bg-white rounded-none border-b border-gray-200">
              <TabsTrigger value="activity" className="flex-1 gap-2">
                <Newspaper className="w-4 h-4" />
                Recent Activity
              </TabsTrigger>
              <TabsTrigger value="taste" className="flex-1 gap-2">
                <BarChart3 className="w-4 h-4" />
                Taste Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-0">
              <div className="bg-white">
                {reviewsWithRestaurants.map(({ review, restaurant }) => (
                  <ProfileActivityCard
                    key={review.id}
                    userAvatar={user.avatar}
                    userName={isCurrentUser ? 'You' : user.displayName}
                    action="ranked"
                    restaurantName={restaurant.name}
                    cuisine={restaurant.cuisine[0]}
                    location={`${restaurant.location.neighborhood}, ${restaurant.location.city}`}
                    rating={review.rating}
                    visitCount={1}
                    image={review.photos?.[0] || restaurant.images?.[0]}
                    notes={review.content}
                    onPress={() => router.push(`/restaurant/${restaurant.id}`)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="taste" className="mt-0">
              {tasteProfileLoading ? (
                <div className="bg-white py-12 text-center">
                  <p className="text-base text-gray-700">Loading taste profile...</p>
                </div>
              ) : tasteProfile ? (
                <div className="py-6 space-y-6">
                  {/* Summary Card */}
                  <div className="px-6">
                    <TasteProfileSummaryCard
                      stats={tasteProfile.last30Days}
                      onShare={handleShare}
                    />
                  </div>

                  {/* Dining Map */}
                  <div className="px-6">
                    <DiningMap
                      locations={tasteProfile.diningLocations}
                      totalCities={tasteProfile.totalCities}
                      totalRestaurants={tasteProfile.totalRestaurants}
                      onShare={handleShare}
                    />
                  </div>

                  {/* Category Tabs */}
                  <div className="px-6">
                    <TasteProfileCategoryTabs
                      activeCategory={tasteCategory}
                      onCategoryChange={setTasteCategory}
                    />
                  </div>

                  {/* Category List */}
                  <div className="px-6">
                    <TasteProfileList
                      data={getCurrentCategoryData}
                      totalCount={
                        tasteCategory === 'cuisines'
                          ? tasteProfile.totalCuisines
                          : tasteCategory === 'cities'
                          ? tasteProfile.totalCities
                          : tasteProfile.totalCountries
                      }
                      sortBy={sortBy}
                      onSortPress={handleSortToggle}
                      onItemPress={handleItemPress}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white py-12 text-center">
                  <p className="text-base text-gray-700">No taste profile data available</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
}
