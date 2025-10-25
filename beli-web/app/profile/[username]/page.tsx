'use client';

import { useEffect, useState } from 'react';
import { MockDataService } from '@/lib/mockDataService';
import { User, Review, Restaurant } from '@/types';
import { notFound } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileListRow } from '@/components/profile/profile-list-row';
import { ProfileStatCard } from '@/components/profile/profile-stat-card';
import { AchievementBanner } from '@/components/profile/achievement-banner';
import { ProfileActivityCard } from '@/components/profile/profile-activity-card';
import { Instagram, Newspaper, BarChart3 } from 'lucide-react';

export default function ProfilePage({ params }: { params: { username: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'activity' | 'taste'>('activity');
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [currentUser, allRestaurants] = await Promise.all([
          MockDataService.getCurrentUser(),
          MockDataService.getAllRestaurants(),
        ]);

        if (!currentUser) {
          notFound();
        }

        const reviews = await MockDataService.getUserReviews(currentUser.id);

        setUser(currentUser);
        setRestaurants(allRestaurants);
        setRecentReviews(reviews.slice(0, 5));
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    notFound();
  }

  const formatMemberSince = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

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
                SC
              </span>
            </div>
            <p className="text-base text-gray-500 mt-1">
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
              <Button variant="outline" className="flex-1">
                Edit profile
              </Button>
              <Button variant="outline" className="flex-1">
                Share profile
              </Button>
            </div>

            {/* Instagram Link */}
            <button className="mt-3 w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <Instagram className="w-6 h-6 text-gray-900" />
            </button>

            {/* Stats Row */}
            <div className="flex justify-around w-full max-w-md mt-8">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{user.stats.followers}</div>
                <div className="text-sm text-gray-500 mt-1">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{user.stats.following}</div>
                <div className="text-sm text-gray-500 mt-1">Following</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">#{user.stats.rank}</div>
                <div className="text-sm text-gray-500 mt-1">Rank on Beli</div>
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
            onPress={() => {}}
            isLast={false}
          />
          <ProfileListRow
            icon="bookmark"
            label="Want to Try"
            count={user.stats.wantToTryCount}
            onPress={() => {}}
            isLast={false}
          />
          <ProfileListRow
            icon="heart"
            label="Recs for You"
            onPress={() => {}}
            isLast={true}
          />
        </div>

        {/* Stat Cards */}
        <div className="flex gap-3 px-4 mt-4">
          <ProfileStatCard
            icon="trophy"
            label="Rank on Beli"
            value={`#${user.stats.rank}`}
            iconColor="#0B7B7F"
          />
          <ProfileStatCard
            icon="flame"
            label="Current Streak"
            value={`${user.stats.currentStreak} weeks`}
            iconColor="#FF6B35"
          />
        </div>

        {/* Achievement Banner */}
        <div className="px-4 mt-4">
          <AchievementBanner
            emoji="🎉"
            text="Congrats! You reached your 2025 goal!"
            progress={1}
            daysLeft={104}
            onSetNewGoal={() => {}}
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
                {recentReviews.map((review) => {
                  const restaurant = restaurants.find((r) => r.id === review.restaurantId);
                  if (!restaurant) return null;

                  return (
                    <ProfileActivityCard
                      key={review.id}
                      userAvatar={user.avatar}
                      userName="You"
                      action="ranked"
                      restaurantName={restaurant.name}
                      cuisine={restaurant.cuisine[0]}
                      location={`${restaurant.location.neighborhood}, ${restaurant.location.city}`}
                      rating={review.rating}
                      visitCount={1}
                      image={review.photos?.[0] || restaurant.images?.[0]}
                      notes={review.content}
                      onPress={() => {}}
                    />
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="taste" className="mt-0">
              <div className="bg-white py-12 text-center">
                <p className="text-base text-gray-500">Taste Profile coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
}
