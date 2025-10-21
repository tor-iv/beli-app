import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import {
  Avatar,
  LoadingSpinner,
  ProfileListRow,
  ProfileStatCard,
  AchievementBanner,
  Button,
  TabSelector,
  ProfileActivityCard,
} from '../components';
import { MockDataService } from '../data/mockDataService';
import type { User, Review, Restaurant } from '../data/mock/types';

type TabId = 'activity' | 'taste';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('activity');
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [currentUser, allRestaurants] = await Promise.all([
        MockDataService.getCurrentUser(),
        MockDataService.getAllRestaurants(),
      ]);

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatMemberSince = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const tabs = [
    { id: 'activity', label: 'Recent Activity', icon: 'newspaper' as const },
    { id: 'taste', label: 'Taste Profile', icon: 'stats-chart' as const },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Name and Menu */}
        <View style={styles.header}>
          <Text style={styles.userName}>{user.displayName}</Text>
          <TouchableOpacity>
            <Ionicons name="menu" size={32} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          {/* Avatar */}
          <Avatar
            source={{ uri: user.avatar }}
            size="xxl"
          />

          {/* Username and Member Since */}
          <View style={styles.usernameContainer}>
            <Text style={styles.username}>@{user.username}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>SC</Text>
            </View>
          </View>
          <Text style={styles.memberSince}>Member since {formatMemberSince(user.memberSince)}</Text>

          {/* Bio */}
          <Text style={styles.bio}>{user.bio}</Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <Button
              title="Edit profile"
              onPress={() => {}}
              variant="secondary"
              style={styles.actionButton}
            />
            <Button
              title="Share profile"
              onPress={() => {}}
              variant="secondary"
              style={styles.actionButton}
            />
          </View>

          {/* Instagram Link */}
          <TouchableOpacity style={styles.instagramButton}>
            <Ionicons name="logo-instagram" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>#{user.stats.rank}</Text>
              <Text style={styles.statLabel}>Rank on Beli</Text>
            </View>
          </View>
        </View>

        {/* List Rows */}
        <View style={styles.listSection}>
          <ProfileListRow
            icon="checkmark-circle"
            label="Been"
            count={user.stats.beenCount}
            onPress={() => {}}
          />
          <ProfileListRow
            icon="bookmark"
            label="Want to Try"
            count={user.stats.wantToTryCount}
            onPress={() => {}}
          />
          <ProfileListRow
            icon="heart"
            label="Recs for You"
            onPress={() => {}}
          />
        </View>

        {/* Stat Cards */}
        <View style={styles.statCardsContainer}>
          <ProfileStatCard
            icon="trophy"
            label="Rank on Beli"
            value={`#${user.stats.rank}`}
            iconColor={colors.primary}
          />
          <ProfileStatCard
            icon="flame"
            label="Current Streak"
            value={`${user.stats.currentStreak} weeks`}
            iconColor="#FF6B35"
          />
        </View>

        {/* Achievement Banner */}
        <AchievementBanner
          emoji="🎉"
          text="Congrats! You reached your 2025 goal!"
          progress={1}
          daysLeft={104}
          onSetNewGoal={() => {}}
        />

        {/* Tabs */}
        <TabSelector
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as TabId)}
        />

        {/* Tab Content */}
        {activeTab === 'activity' && (
          <View style={styles.tabContent}>
            {recentReviews.map((review) => {
              const restaurant = restaurants.find(r => r.id === review.restaurantId);
              if (!restaurant) return null;

              return (
                <ProfileActivityCard
                  key={review.id}
                  userAvatar={user.avatar}
                  userName="You"
                  action="ranked"
                  restaurantName={restaurant.name}
                  cuisine={restaurant.cuisine[0]}
                  location={restaurant.location.neighborhood + ', ' + restaurant.location.city}
                  rating={review.rating}
                  visitCount={1}
                  image={review.photos?.[0] || restaurant.images?.[0]}
                  notes={review.notes}
                  onPress={() => {}}
                />
              );
            })}
          </View>
        )}

        {activeTab === 'taste' && (
          <View style={styles.tabContent}>
            <Text style={styles.placeholder}>Taste Profile coming soon...</Text>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.sizes.base,
    color: colors.error,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
  },
  userName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  profileSection: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  username: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  memberSince: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  bio: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
  instagramButton: {
    marginTop: spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  listSection: {
    backgroundColor: colors.white,
    marginTop: spacing.md,
  },
  statCardsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  tabContent: {
    backgroundColor: colors.white,
  },
  placeholder: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
