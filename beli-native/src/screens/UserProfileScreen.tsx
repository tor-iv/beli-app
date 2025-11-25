import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { colors, typography, spacing } from '../theme';
import {
  Avatar,
  LoadingSpinner,
  ProfileListRow,
  ProfileStatCard,
  FollowButton,
  MatchPercentage,
} from '../components';
import { TabSelector } from '../components/navigation/TabSelector';
import {
  useUser,
  useCurrentUser,
  useIsFollowing,
  useMatchPercentage,
  useFollowUser,
  useUnfollowUser,
} from '../lib/hooks';
import { MockDataService } from '../data/mockDataService';
import type { Review } from '../types';
import type { AppStackParamList } from '../navigation/types';

type TabId = 'activity' | 'taste' | 'curated';
type UserProfileScreenRouteProp = RouteProp<AppStackParamList, 'UserProfile'>;
type UserProfileScreenNavigationProp = StackNavigationProp<AppStackParamList>;

export default function UserProfileScreen() {
  const navigation = useNavigation<UserProfileScreenNavigationProp>();
  const route = useRoute<UserProfileScreenRouteProp>();
  const { userId } = route.params;

  // Data fetching with React Query hooks
  const { data: currentUser } = useCurrentUser();
  const { data: user, isLoading: userLoading } = useUser(userId);
  const { data: isFollowingUser = false } = useIsFollowing(currentUser?.id || '', userId);
  const { data: matchPercentage = 0 } = useMatchPercentage(currentUser?.id || '', userId);

  // Mutation hooks
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  // Local UI state
  const [activeTab, setActiveTab] = useState<TabId>('activity');
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [sharedWantToTryCount, setSharedWantToTryCount] = useState(0);

  // Load additional data that doesn't have hooks yet
  useEffect(() => {
    const loadAdditionalData = async () => {
      if (!user) return;
      try {
        const [sharedRestaurants, reviews] = await Promise.all([
          MockDataService.getSharedWantToTry(userId),
          MockDataService.getUserReviews(user.id),
        ]);
        setSharedWantToTryCount(sharedRestaurants.length);
        setRecentReviews(reviews.slice(0, 5));
      } catch (error) {
        console.error('Failed to load additional data:', error);
      }
    };
    loadAdditionalData();
  }, [user, userId]);

  const handleFollowPress = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      if (isFollowingUser) {
        await unfollowUser.mutateAsync({ userId: currentUser.id, targetUserId: userId });
      } else {
        await followUser.mutateAsync({ userId: currentUser.id, targetUserId: userId });
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  }, [currentUser, isFollowingUser, userId, followUser, unfollowUser]);

  const isLoading = userLoading;
  const followLoading = followUser.isPending || unfollowUser.isPending;

  if (isLoading) {
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
          <Text style={styles.errorText}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatMemberSince = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Conditionally add 'Curated Lists' tab for tastemakers
  const tabs = user.isTastemaker
    ? [
        { id: 'activity', label: 'Recent Activity', icon: 'newspaper' as const },
        { id: 'taste', label: 'Taste Profile', icon: 'stats-chart' as const },
        { id: 'curated', label: 'Curated Lists', icon: 'list' as const },
      ]
    : [
        { id: 'activity', label: 'Recent Activity', icon: 'newspaper' as const },
        { id: 'taste', label: 'Taste Profile', icon: 'stats-chart' as const },
      ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back button, name, and actions */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {user.displayName}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          {/* Avatar */}
          <Avatar
            source={{ uri: user.avatar }}
            size="profile"
            initials={user.displayName.substring(0, 2).toUpperCase()}
          />

          {/* Username and Member Since */}
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.memberSince}>Member since {formatMemberSince(user.memberSince)}</Text>

          {/* Match Percentage */}
          <View style={styles.matchContainer}>
            <MatchPercentage percentage={matchPercentage} />
          </View>

          {/* Follow Button */}
          <View style={styles.followButtonContainer}>
            <FollowButton
              isFollowing={isFollowingUser}
              onPress={handleFollowPress}
              disabled={followLoading}
            />
          </View>

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
              <Text style={styles.statValue}>
                {user.stats.rank ? `#${user.stats.rank}` : '-'}
              </Text>
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
            icon="people"
            label="Places you both want to try"
            count={sharedWantToTryCount}
            onPress={() => {}}
            isLast={true}
          />
        </View>

        {/* Stat Cards */}
        <View style={styles.statCardsSection}>
          <ProfileStatCard
            icon="trophy"
            label="Rank on Beli"
            value={user.stats.rank ? `#${user.stats.rank}` : '-'}
          />
          <ProfileStatCard
            icon="flame"
            label="Current Streak"
            value={`${user.stats.currentStreak} weeks`}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabsSection}>
          <TabSelector
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as TabId)}
          />
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'activity' && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {recentReviews.length > 0
                  ? `${user.displayName} has ${recentReviews.length} recent reviews`
                  : 'No recent activity'}
              </Text>
            </View>
          )}

          {activeTab === 'taste' && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Taste profile coming soon</Text>
            </View>
          )}

          {activeTab === 'curated' && user.isTastemaker && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Curated lists by {user.displayName} coming soon
              </Text>
            </View>
          )}
        </View>
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
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIcon: {
    width: 40,
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  username: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  memberSince: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  matchContainer: {
    marginTop: spacing.sm,
  },
  followButtonContainer: {
    marginTop: spacing.md,
    width: '100%',
    alignItems: 'center',
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
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  listSection: {
    backgroundColor: colors.cardBackground,
    marginBottom: spacing.md,
  },
  statCardsSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  tabsSection: {
    marginBottom: spacing.md,
  },
  tabContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
});
