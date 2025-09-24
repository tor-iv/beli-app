import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl, ScrollView, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, typography, spacing } from '../theme';
import { ActivityCard, LoadingSpinner } from '../components';
import { MockDataService } from '../data/mockDataService';
import type { Activity } from '../data/mock/types';

type BottomTabParamList = {
  Feed: undefined;
  Lists: undefined;
  Search: { autoFocus?: boolean } | undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

export default function FeedScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = async () => {
    try {
      const feedData = await MockDataService.getActivityFeed();
      setActivities(feedData);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  const handleSearchPress = () => {
    navigation.navigate('Search', { autoFocus: true });
  };

  const renderActivity = ({ item }: { item: Activity }) => (
    <ActivityCard activity={item} />
  );

  const renderHeader = () => (
    <View>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>beli</Text>
          <View style={styles.scBadge}>
            <Text style={styles.scText}>SC</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <Pressable style={styles.iconButton}>
            <Ionicons name="calendar-outline" size={24} color={colors.textPrimary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>1</Text>
            </View>
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>1</Text>
            </View>
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Ionicons name="menu-outline" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Pressable style={styles.searchBar} onPress={handleSearchPress}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search a restaurant, member, etc.</Text>
        </Pressable>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable style={styles.actionButton}>
          <Ionicons
            name="calendar"
            size={18}
            color={colors.textInverse}
            style={styles.actionButtonIcon}
          />
          <Text style={styles.actionButtonText}>Reserve now</Text>
        </Pressable>
        <Pressable style={styles.actionButton}>
          <Ionicons
            name="navigate"
            size={18}
            color={colors.textInverse}
            style={styles.actionButtonIcon}
          />
          <Text style={styles.actionButtonText}>Recs Nearby</Text>
        </Pressable>
        <Pressable style={styles.actionButton}>
          <Ionicons
            name="trending-up"
            size={18}
            color={colors.textInverse}
            style={styles.actionButtonIcon}
          />
          <Text style={styles.actionButtonText}>Trending</Text>
        </Pressable>
        <Pressable style={styles.actionButton}>
          <Ionicons
            name="people"
            size={18}
            color={colors.textInverse}
            style={styles.actionButtonIcon}
          />
          <Text style={styles.actionButtonText}>Friend recs</Text>
        </Pressable>
      </View>

      {/* Invite Section - Hidden for now */}
      {false && (
        <Pressable style={styles.inviteCard}>
          <View style={styles.inviteIcon}>
            <Ionicons name="mail-outline" size={24} color={colors.textPrimary} />
          </View>
          <View style={styles.inviteContent}>
            <Text style={styles.inviteTitle}>Invite or nominate friends</Text>
            <Text style={styles.inviteSubtitle}>Invite friends to Beli or nominate to Supper Club</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </Pressable>
      )}

      {/* Featured Lists */}
      <View style={styles.featuredSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FEATURED LISTS</Text>
          <Text style={styles.seeAllText}>See all</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
          <View style={styles.featuredCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop' }}
              style={styles.featuredImage}
            />
            <View style={styles.featuredOverlay}>
              <Text style={styles.featuredCardTitle}>Top 10 NYC Spanish</Text>
              <Text style={styles.featuredCardSubtitle}>You've been to 0 of 10</Text>
            </View>
          </View>
          <View style={styles.featuredCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=300&h=200&fit=crop' }}
              style={styles.featuredImage}
            />
            <View style={styles.featuredOverlay}>
              <Text style={styles.featuredCardTitle}>Top 10 NYC Sports Bars</Text>
              <Text style={styles.featuredCardSubtitle}>You've been to 1 of 10</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Feed Header */}
      <View style={styles.feedHeader}>
        <Text style={styles.feedTitle}>YOUR FEED</Text>
        <Pressable style={styles.filtersButton}>
          <View style={styles.scBadgeSmall}>
            <Text style={styles.scTextSmall}>SC</Text>
          </View>
          <Text style={styles.filtersText}>Filters</Text>
          <Ionicons name="chevron-down" size={16} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Top Header Styles
  topHeader: {
    backgroundColor: colors.cardWhite,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    paddingTop: spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: spacing.xs,
  },
  scBadge: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  scText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: spacing.md,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Search Bar Styles
  searchContainer: {
    backgroundColor: colors.cardWhite,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  searchBar: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: colors.textSecondary,
  },

  // Action Buttons Styles
  actionButtons: {
    backgroundColor: colors.cardWhite,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
  },
  actionButtonIcon: {
    marginRight: spacing.xs,
  },
  actionButtonText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '500',
  },

  // Invite Card Styles
  inviteCard: {
    backgroundColor: colors.cardWhite,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inviteIcon: {
    marginRight: spacing.md,
  },
  inviteContent: {
    flex: 1,
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  inviteSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Featured Lists Styles
  featuredSection: {
    marginTop: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  featuredScroll: {
    paddingLeft: spacing.lg,
  },
  featuredCard: {
    width: 200,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: spacing.md,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: spacing.sm,
  },
  featuredCardTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  featuredCardSubtitle: {
    color: colors.white,
    fontSize: 12,
    opacity: 0.9,
  },

  // Feed Header Styles
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  feedTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardWhite,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.borderMedium,
    gap: spacing.xs,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scBadgeSmall: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  scTextSmall: {
    color: colors.white,
    fontSize: 8,
    fontWeight: 'bold',
  },
  filtersText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
});
