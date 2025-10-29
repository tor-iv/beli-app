import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { colors, typography, spacing } from '../theme';
import {
  Avatar,
  LoadingSpinner,
  ProfileListRow,
  ProfileStatCard,
  AchievementBanner,
  Button,
  ProfileActivityCard,
  HamburgerMenu,
  TasteProfileSummaryCard,
  DiningMap,
  TasteProfileCategoryTab,
  TasteProfileList,
} from '../components';
import { TabSelector } from '../components/navigation/TabSelector';
import { SortOptionsModal } from '../components/modals/SortOptionsModal';
import { MockDataService } from '../data/mockDataService';
import type { User, Review, Restaurant, TasteProfileStats, CuisineBreakdown, CityBreakdown, CountryBreakdown } from '../types';
import type { AppStackParamList } from '../navigation/types';
import type { TasteProfileCategory } from '../components/profile/TasteProfileCategoryTab';
import type { SortOption } from '../components/profile/TasteProfileList';

type TabId = 'activity' | 'taste';
type ProfileScreenNavigationProp = StackNavigationProp<AppStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('activity');
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);

  // Taste profile state
  const [tasteProfile, setTasteProfile] = useState<TasteProfileStats | null>(null);
  const [activeCategory, setActiveCategory] = useState<TasteProfileCategory>('cuisines');
  const [sortBy, setSortBy] = useState<SortOption>('count');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [currentUser, allRestaurants] = await Promise.all([
        MockDataService.getCurrentUser(),
        MockDataService.getAllRestaurants(),
      ]);

      const [reviews, tasteProfileData] = await Promise.all([
        MockDataService.getUserReviews(currentUser.id),
        MockDataService.getUserTasteProfile(currentUser.id),
      ]);

      setUser(currentUser);
      setRestaurants(allRestaurants);
      setRecentReviews(reviews.slice(0, 5));
      setTasteProfile(tasteProfileData);
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

  // Get current category data
  const getCurrentCategoryData = (): Array<CuisineBreakdown | CityBreakdown | CountryBreakdown> => {
    if (!tasteProfile) return [];

    let data: Array<CuisineBreakdown | CityBreakdown | CountryBreakdown> = [];

    switch (activeCategory) {
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
  };

  const handleTasteProfileItemPress = (item: CuisineBreakdown | CityBreakdown | CountryBreakdown) => {
    // Determine filter type and value
    let filterType: 'cuisine' | 'city' | 'country';
    let filterValue: string;

    if ('cuisine' in item) {
      filterType = 'cuisine';
      filterValue = item.cuisine;
    } else if ('city' in item) {
      filterType = 'city';
      filterValue = item.city;
    } else {
      filterType = 'country';
      filterValue = item.country;
    }

    // Navigate to Lists screen with filter
    navigation.navigate('Tabs', {
      screen: 'Lists',
      params: {
        initialTab: 'been',
        filterType,
        filterValue,
        sortBy,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Name and Menu */}
        <View style={styles.header}>
          <Text style={styles.userName}>{user.displayName}</Text>
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={32} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          {/* Avatar */}
          <Avatar
            source={{ uri: user.avatar }}
            size="profile"
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
            onPress={() => navigation.navigate('Tabs', {
              screen: 'Lists',
              params: { initialTab: 'been' }
            })}
            isLast={false}
          />
          <ProfileListRow
            icon="bookmark"
            label="Want to Try"
            count={user.stats.wantToTryCount}
            onPress={() => navigation.navigate('Tabs', {
              screen: 'Lists',
              params: { initialTab: 'want' }
            })}
            isLast={false}
          />
          <ProfileListRow
            icon="heart"
            label="Recs for You"
            onPress={() => navigation.navigate('Tabs', {
              screen: 'Lists',
              params: { initialTab: 'recs_for_you' }
            })}
            isLast={true}
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
                  notes={review.content}
                  onPress={() => {}}
                />
              );
            })}
          </View>
        )}

        {activeTab === 'taste' && tasteProfile && (
          <View style={styles.tabContent}>
            {/* Summary Card */}
            <TasteProfileSummaryCard
              stats={tasteProfile.last30Days}
              onShare={() => console.log('Share summary')}
            />

            {/* Dining Map */}
            <DiningMap
              locations={tasteProfile.diningLocations}
              totalCities={tasteProfile.totalCities}
              totalRestaurants={tasteProfile.totalRestaurants}
              onShare={() => console.log('Share map')}
            />

            {/* Category Tabs */}
            <TasteProfileCategoryTab
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />

            {/* List */}
            <TasteProfileList
              data={getCurrentCategoryData()}
              totalCount={
                activeCategory === 'cuisines'
                  ? tasteProfile.totalCuisines
                  : activeCategory === 'cities'
                  ? tasteProfile.totalCities
                  : tasteProfile.totalCountries
              }
              sortBy={sortBy}
              onSortPress={() => setSortModalVisible(true)}
              onItemPress={handleTasteProfileItemPress}
            />
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Menu */}
      <HamburgerMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
      />

      {/* Sort Modal */}
      <SortOptionsModal
        visible={sortModalVisible}
        currentSort={sortBy}
        onSelectSort={setSortBy}
        onClose={() => setSortModalVisible(false)}
      />
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
    fontSize: typography.sizes['3xl'],
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
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  username: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
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
    color: colors.textTertiary,
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
    marginTop: spacing['2xl'],
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
    color: colors.textTertiary,
    marginTop: 4,
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
