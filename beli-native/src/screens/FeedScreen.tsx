import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { colors, typography, spacing } from '../theme';
import { ActivityCard, LoadingSpinner, AddRestaurantModal, FeaturedListCard } from '../components';
import { RankingResultModal } from '../components/modals/RankingResultModal';
import type { RestaurantSubmissionData } from '../components';
import HamburgerMenu from '../components/modals/HamburgerMenu';
import { FeedFiltersModal, type FeedFilters } from '../components/modals/FeedFiltersModal';
import { ShareModal } from '../components/modals/ShareModal';
import { CommentsModal } from '../components/modals/CommentsModal';
import {
  useFeed,
  useFeaturedLists,
  useUnreadCount,
  useCurrentUser,
} from '../lib/hooks';
import { MockDataService } from '../data/mockDataService';
import type { Activity } from '../data/mock/types';
import type { Restaurant, RankingResult } from '../types';
import type { BottomTabParamList, AppStackParamList } from '../navigation/types';

type FeedScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Feed'>,
  NativeStackNavigationProp<AppStackParamList>
>;

export default function FeedScreen() {
  const navigation = useNavigation<FeedScreenNavigationProp>();
  const queryClient = useQueryClient();

  // Data fetching with React Query hooks
  const { data: currentUser } = useCurrentUser();
  const {
    data: activities = [],
    isLoading: feedLoading,
    refetch: refetchFeed,
    isRefetching: feedRefetching,
  } = useFeed(currentUser?.id);
  const { data: allFeaturedLists = [] } = useFeaturedLists();
  const { data: unreadNotificationCount = 0, refetch: refetchUnread } = useUnreadCount(currentUser?.id);

  // Get first 6 featured lists for display
  const featuredLists = useMemo(() => allFeaturedLists.slice(0, 6), [allFeaturedLists]);

  // UI state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [feedFilters, setFeedFilters] = useState<FeedFilters>({
    rankingsOnly: false,
    topRatedOnly: false,
    restaurantsOnly: false,
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [rankingResult, setRankingResult] = useState<RankingResult | null>(null);
  const [submissionData, setSubmissionData] = useState<RestaurantSubmissionData | null>(null);

  // Memoized filter function
  const filteredActivities = useMemo(() => {
    let filtered = [...activities];

    if (feedFilters.rankingsOnly) {
      filtered = filtered.filter(activity => activity.rating && activity.rating > 0);
    }

    if (feedFilters.topRatedOnly) {
      filtered = filtered.filter(activity => activity.rating && activity.rating >= 9);
    }

    if (feedFilters.restaurantsOnly) {
      filtered = filtered.filter(activity =>
        !activity.restaurant.tags?.some(tag =>
          ['bar', 'bakery', 'cafe', 'coffee', 'dessert'].includes(tag.toLowerCase())
        )
      );
    }

    return filtered;
  }, [activities, feedFilters]);

  const loading = feedLoading;
  const refreshing = feedRefetching;

  // Refresh notification count when screen gains focus
  useFocusEffect(
    useCallback(() => {
      refetchUnread();
    }, [refetchUnread])
  );

  const handleApplyFilters = (filters: FeedFilters) => {
    setFeedFilters(filters);
  };

  const onRefresh = () => {
    refetchFeed();
    refetchUnread();
  };

  const handleSearchPress = () => {
    navigation.navigate('Search', { autoFocus: true });
  };

  const handleNotificationsPress = () => {
    navigation.navigate('Notifications');
  };

  const handleGroupDinnerPress = () => {
    navigation.navigate('GroupDinner');
  };

  const handleRestaurantPress = (restaurantId: string) => {
    navigation.navigate('RestaurantInfo', { restaurantId });
  };

  const handleAddPress = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setSelectedRestaurant(null);
  };

  const handleModalSubmit = async (data: RestaurantSubmissionData) => {
    if (!selectedRestaurant || !currentUser) return;

    try {
      // Convert rating to numeric value
      const ratingValue = data.rating === 'liked' ? 8 : data.rating === 'fine' ? 5 : 3;

      await MockDataService.addRestaurantToUserList(
        currentUser.id,
        selectedRestaurant.id,
        'been', // Status is 'been' since they're ranking it
        {
          rating: ratingValue,
          notes: data.notes,
          photos: data.photos,
          tags: data.labels,
        }
      );

      Alert.alert(
        'Success!',
        `${selectedRestaurant.name} has been added to your list.`,
        [{ text: 'OK' }]
      );

      // Refresh the feed to show any updates
      refetchFeed();
    } catch (error) {
      console.error('Failed to add restaurant:', error);
      Alert.alert(
        'Error',
        'Failed to add restaurant. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRankingComplete = async (result: RankingResult, data: RestaurantSubmissionData) => {
    if (!currentUser || !selectedRestaurant) return;

    try {
      // Save the ranked restaurant to the user's list
      await MockDataService.insertRankedRestaurant(
        currentUser.id,
        selectedRestaurant.id,
        result.category,
        result.finalPosition,
        result.rating,
        {
          notes: data.notes,
          photos: data.photos,
          tags: data.labels,
          companions: data.companions,
        }
      );

      // Store the result and data for the result modal
      setRankingResult(result);
      setSubmissionData(data);

      // Close add modal and show result modal
      setShowAddModal(false);
      setShowResultModal(true);

      // Refresh the feed to show any updates
      refetchFeed();
    } catch (error) {
      console.error('Error saving ranked restaurant:', error);
      Alert.alert(
        'Error',
        'Failed to save ranking. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleResultDone = () => {
    setShowResultModal(false);
    setRankingResult(null);
    setSubmissionData(null);
    setSelectedRestaurant(null);
  };

  const handleLike = (activityId: string) => {
    if (!currentUser) return;

    // Optimistic update using queryClient
    queryClient.setQueryData(['feed', currentUser.id], (oldData: Activity[] | undefined) => {
      if (!oldData) return oldData;
      return oldData.map((activity) => {
        if (activity.id === activityId) {
          const likes = activity.interactions?.likes || [];
          const isLiked = likes.includes(currentUser.id);

          return {
            ...activity,
            interactions: {
              ...activity.interactions,
              likes: isLiked
                ? likes.filter((id) => id !== currentUser.id)
                : [...likes, currentUser.id],
              comments: activity.interactions?.comments || [],
              bookmarks: activity.interactions?.bookmarks || [],
            },
          };
        }
        return activity;
      });
    });
  };

  const handleComment = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowCommentsModal(true);
  };

  const handleShare = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowShareModal(true);
  };

  const handleBookmark = (activityId: string) => {
    if (!currentUser) return;

    // Optimistic update using queryClient
    queryClient.setQueryData(['feed', currentUser.id], (oldData: Activity[] | undefined) => {
      if (!oldData) return oldData;
      return oldData.map((activity) => {
        if (activity.id === activityId) {
          const bookmarks = activity.interactions?.bookmarks || [];
          const isBookmarked = bookmarks.includes(currentUser.id);

          return {
            ...activity,
            interactions: {
              ...activity.interactions,
              bookmarks: isBookmarked
                ? bookmarks.filter((id) => id !== currentUser.id)
                : [...bookmarks, currentUser.id],
              likes: activity.interactions?.likes || [],
              comments: activity.interactions?.comments || [],
            },
          };
        }
        return activity;
      });
    });
  };

  const handleAddComment = (content: string) => {
    if (!selectedActivity || !currentUser) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      content,
      timestamp: new Date(),
    };

    // Optimistic update using queryClient
    queryClient.setQueryData(['feed', currentUser.id], (oldData: Activity[] | undefined) => {
      if (!oldData) return oldData;
      return oldData.map((activity) => {
        if (activity.id === selectedActivity.id) {
          return {
            ...activity,
            interactions: {
              ...activity.interactions,
              comments: [...(activity.interactions?.comments || []), newComment],
              likes: activity.interactions?.likes || [],
              bookmarks: activity.interactions?.bookmarks || [],
            },
          };
        }
        return activity;
      });
    });
  };

  const renderActivity = ({ item }: { item: Activity }) => (
    <ActivityCard
      activity={item}
      onPress={() => handleRestaurantPress(item.restaurant.id)}
      onRestaurantPress={handleRestaurantPress}
      onAddPress={() => handleAddPress(item.restaurant)}
      onLike={() => handleLike(item.id)}
      onComment={() => handleComment(item)}
      onShare={() => handleShare(item)}
      onBookmark={() => handleBookmark(item.id)}
      currentUserId={currentUser?.id}
    />
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
          <Pressable style={styles.iconButton} onPress={() => navigation.navigate('ReservationSharing')}>
            <Ionicons name="calendar-outline" size={24} color={colors.textPrimary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>1</Text>
            </View>
          </Pressable>
          <Pressable style={styles.iconButton} onPress={handleGroupDinnerPress}>
            <Ionicons name="restaurant-outline" size={24} color={colors.textPrimary} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={handleNotificationsPress}>
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
            {unreadNotificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{unreadNotificationCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => setShowMenu(true)}>
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
        <Pressable style={styles.actionButton} onPress={() => navigation.navigate('ReservationSharing')}>
          <Ionicons
            name="calendar"
            size={18}
            color={colors.textInverse}
            style={styles.actionButtonIcon}
          />
          <Text style={styles.actionButtonText}>Reserve now</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => navigation.navigate('Lists', { initialTab: 'recs' })}
        >
          <Ionicons
            name="navigate"
            size={18}
            color={colors.textInverse}
            style={styles.actionButtonIcon}
          />
          <Text style={styles.actionButtonText}>Recs Nearby</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => navigation.navigate('Lists', { initialTab: 'trending' })}
        >
          <Ionicons
            name="trending-up"
            size={18}
            color={colors.textInverse}
            style={styles.actionButtonIcon}
          />
          <Text style={styles.actionButtonText}>Trending</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => navigation.navigate('Lists', { initialTab: 'recs_from_friends' })}
        >
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

      {/* Tastemakers */}
      {featuredLists.length > 0 && (
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TASTEMAKERS</Text>
            <Pressable onPress={() => navigation.navigate('Tastemakers')}>
              <Text style={styles.seeAllText}>See all</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScroll}
          >
            {featuredLists.map((list) => (
              <FeaturedListCard
                key={list.id}
                list={list}
                onPress={() => navigation.navigate('FeaturedListDetail', { listId: list.id })}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Feed Header */}
      <View style={styles.feedHeader}>
        <Text style={styles.feedTitle}>YOUR FEED</Text>
        <Pressable style={styles.filtersButton} onPress={() => setShowFiltersModal(true)}>
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
        data={filteredActivities}
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

      {selectedRestaurant && currentUser && (
        <AddRestaurantModal
          visible={showAddModal}
          restaurant={selectedRestaurant}
          userId={currentUser.id}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          onRankingComplete={handleRankingComplete}
        />
      )}

      {/* Ranking Result Modal */}
      {selectedRestaurant && currentUser && rankingResult && (
        <RankingResultModal
          visible={showResultModal}
          restaurant={selectedRestaurant}
          user={currentUser}
          result={rankingResult}
          notes={submissionData?.notes}
          photos={submissionData?.photos}
          onClose={() => setShowResultModal(false)}
          onDone={handleResultDone}
        />
      )}

      <FeedFiltersModal
        visible={showFiltersModal}
        filters={feedFilters}
        onClose={() => setShowFiltersModal(false)}
        onApply={handleApplyFilters}
      />

      <HamburgerMenu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        navigation={navigation}
      />

      {selectedActivity && (
        <>
          <ShareModal
            visible={showShareModal}
            restaurant={selectedActivity.restaurant}
            user={selectedActivity.user}
            onClose={() => {
              setShowShareModal(false);
              setSelectedActivity(null);
            }}
          />

          <CommentsModal
            visible={showCommentsModal}
            activity={selectedActivity}
            currentUser={currentUser || undefined}
            onClose={() => {
              setShowCommentsModal(false);
              setSelectedActivity(null);
            }}
            onAddComment={handleAddComment}
          />
        </>
      )}
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
    paddingRight: spacing.lg,
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
