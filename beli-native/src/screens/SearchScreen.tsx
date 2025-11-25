import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable, ScrollView, TextInput, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';
import { colors, typography, spacing } from '../theme';
import { SearchBar, LoadingSpinner, EmptyState, UserSearchResultCard } from '../components';
import {
  useRestaurants,
  useSearchRestaurants,
  useSearchUsers,
  useCurrentUser,
} from '../lib/hooks';
import { MockDataService } from '../data/mockDataService';
import type { Restaurant, User } from '../data/mock/types';
import type { BottomTabParamList, AppStackParamList } from '../navigation/types';

type SearchScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Search'>,
  StackNavigationProp<AppStackParamList>
>;

type SearchScreenRouteProp = RouteProp<BottomTabParamList, 'Search'>;

export default function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const route = useRoute<SearchScreenRouteProp>();
  const searchInputRef = useRef<TextInput | null>(null);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSegment, setActiveSegment] = useState<'Restaurants' | 'Members'>('Restaurants');
  const [location, setLocation] = useState('Current Location');
  const [recentRestaurants, setRecentRestaurants] = useState<Restaurant[]>([]);
  const [memberMatchPercentages, setMemberMatchPercentages] = useState<Record<string, number>>({});

  // Data fetching with React Query hooks
  const { data: currentUser } = useCurrentUser();
  const { data: allRestaurants = [], isLoading: restaurantsLoading } = useRestaurants();

  // Search hooks - automatically handles debouncing via staleTime
  const trimmedQuery = searchQuery.trim();
  const {
    data: searchedRestaurants = [],
    isFetching: searchingRestaurants,
  } = useSearchRestaurants(trimmedQuery, undefined, activeSegment === 'Restaurants' && trimmedQuery.length > 0);

  const {
    data: searchedMembers = [],
    isFetching: searchingMembers,
  } = useSearchUsers(trimmedQuery, activeSegment === 'Members' && trimmedQuery.length > 0);

  // Derive filtered results
  const filteredRestaurants = useMemo(() => {
    if (trimmedQuery && activeSegment === 'Restaurants') {
      return searchedRestaurants;
    }
    return allRestaurants;
  }, [trimmedQuery, activeSegment, searchedRestaurants, allRestaurants]);

  const filteredMembers = searchedMembers;

  const handleLocationPress = () => {};

  const handleRestaurantPress = (restaurantId: string) => {
    navigation.navigate('RestaurantInfo', { restaurantId });
  };

  const handleMemberPress = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  // Handle autoFocus from navigation params
  useEffect(() => {
    if (route.params?.autoFocus) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);

      if (typeof navigation.setParams === 'function') {
        navigation.setParams({ autoFocus: false });
      }
    }
  }, [route.params?.autoFocus, navigation]);

  // Set recent restaurants from all restaurants
  useEffect(() => {
    if (allRestaurants.length > 0 && recentRestaurants.length === 0) {
      setRecentRestaurants(allRestaurants.slice(0, 6));
    }
  }, [allRestaurants, recentRestaurants.length]);

  // Load match percentages for member search results
  useEffect(() => {
    if (searchedMembers.length === 0 || !currentUser) return;

    const loadMatchPercentages = async () => {
      const percentages: Record<string, number> = {};
      for (const user of searchedMembers) {
        const match = await MockDataService.getUserMatchPercentage(user.id);
        percentages[user.id] = match;
      }
      setMemberMatchPercentages(percentages);
    };

    loadMatchPercentages();
  }, [searchedMembers, currentUser]);

  const isLoading = restaurantsLoading;

  const segments = [
    {
      key: 'Restaurants' as const,
      label: 'Restaurants',
      icon: 'business-outline' as const,
      activeIcon: 'business' as const,
    },
    {
      key: 'Members' as const,
      label: 'Members',
      icon: 'people-outline' as const,
      activeIcon: 'people' as const,
    },
  ];

  const quickActions = [
    { key: 'reserve', label: 'Reserve now', icon: 'calendar' as const },
    { key: 'recs', label: 'Recs', icon: 'heart' as const },
    { key: 'trending', label: 'Trending', icon: 'trending-up' as const },
    { key: 'friends', label: 'Friend recs', icon: 'people' as const },
  ];

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleClearLocation = () => {
    setLocation('');
  };

  const handleRemoveRecent = (restaurantId: string) => {
    setRecentRestaurants(prev => prev.filter(restaurant => restaurant.id !== restaurantId));
  };

  const handleQuickActionPress = (actionKey: string) => {
    // TODO: hook up quick action navigation
  };

  const renderRestaurantRow = ({ item }: { item: Restaurant }) => {
    const isRecent = !searchQuery.trim();
    const rowIcon = isRecent ? 'time-outline' : 'search-outline';
    const subtitleParts = [item.location?.neighborhood, item.location?.city].filter(Boolean);
    const subtitle = subtitleParts.join(', ');
    const handleRemovePress = (event: GestureResponderEvent) => {
      event.stopPropagation();
      handleRemoveRecent(item.id);
    };
    return (
      <Pressable style={styles.recentRow} onPress={() => handleRestaurantPress(item.id)}>
        <View style={styles.recentInfo}>
          <Ionicons name={rowIcon} size={18} color={colors.textSecondary} style={styles.recentIcon} />
          <View style={styles.recentTextContainer}>
            <Text style={styles.recentTitle} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.recentSubtitle} numberOfLines={1}>
              {subtitle || 'Location unavailable'}
            </Text>
          </View>
        </View>
        {isRecent && (
          <Pressable onPress={handleRemovePress} hitSlop={8}>
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </Pressable>
    );
  };

  const renderSegmentedControl = () => (
    <View style={styles.segmentedControl}>
      {segments.map((segment, index) => {
        const isActive = activeSegment === segment.key;
        return (
          <Pressable
            key={segment.key}
            style={[
              styles.segmentButton,
              index !== segments.length - 1 && styles.segmentButtonSpacing,
              isActive ? styles.segmentButtonActive : styles.segmentButtonInactive,
            ]}
            onPress={() => setActiveSegment(segment.key)}
          >
            <Ionicons
              name={isActive ? segment.activeIcon : segment.icon}
              size={20}
              color={isActive ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentLabel,
                isActive ? styles.segmentLabelActive : styles.segmentLabelInactive,
              ]}
            >
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderPrimaryInputs = () => {
    const searchPlaceholder =
      activeSegment === 'Restaurants'
        ? 'Search restaurant, cuisine, occasion'
        : 'Search members';
    const showLocation = activeSegment === 'Restaurants';
    const showQuickActions = activeSegment === 'Restaurants';

    return (
      <>
        <SearchBar
          ref={searchInputRef}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={searchPlaceholder}
          onClear={handleClearSearch}
          autoFocus={Boolean(route.params?.autoFocus)}
          style={styles.searchInput}
        />
        {showLocation && (
          <View style={styles.locationInputContainer}>
            <Pressable style={styles.locationInput} onPress={handleLocationPress}>
              <View style={styles.locationContent}>
                <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
                <Text
                  style={[
                    styles.locationText,
                    location ? styles.locationTextActive : styles.locationTextPlaceholder,
                  ]}
                >
                  {location || 'Add location'}
                </Text>
              </View>
              {location ? (
                <Pressable onPress={handleClearLocation} hitSlop={8}>
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </Pressable>
              ) : null}
            </Pressable>
          </View>
        )}
        {showQuickActions && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsRow}
          >
            {quickActions.map((action, index) => (
              <Pressable
                key={action.key}
                style={[
                  styles.quickActionButton,
                  index === quickActions.length - 1 && styles.quickActionButtonLast,
                ]}
                onPress={() => handleQuickActionPress(action.key)}
              >
                <Ionicons
                  name={action.icon}
                  size={18}
                  color={colors.textInverse}
                  style={styles.quickActionIcon}
                />
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </>
    );
  };

  const renderContent = () => {
    if (activeSegment === 'Members') {
      // Handle member search loading
      if (searchQuery.trim() && searchingMembers) {
        return (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="large" />
          </View>
        );
      }

      // Handle empty search query
      if (!searchQuery.trim()) {
        return (
          <EmptyState
            title="Search members"
            description="Find and follow friends by name or username"
            icon="people-outline"
          />
        );
      }

      // Handle no results
      if (filteredMembers.length === 0) {
        return (
          <EmptyState
            title="No members found"
            description={`No results for "${searchQuery}"`}
            icon="search-outline"
          />
        );
      }

      // Render member search results
      return (
        <FlatList
          data={filteredMembers}
          renderItem={({ item }) => (
            <UserSearchResultCard
              user={item}
              matchPercentage={memberMatchPercentages[item.id] || 0}
              onPress={() => handleMemberPress(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={() => (
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>Results</Text>
            </View>
          )}
        />
      );
    }

    if (searchQuery.trim() && searchingRestaurants) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </View>
      );
    }

    if (searchQuery.trim() && filteredRestaurants.length === 0) {
      return (
        <EmptyState
          title={searchQuery ? 'No restaurants found' : 'Start searching'}
          description={
            searchQuery
              ? `No results for "${searchQuery}"`
              : 'Search for restaurants by name, cuisine, or neighborhood'
          }
          icon="search-outline"
        />
      );
    }

    const isSearching = searchQuery.trim().length > 0;
    const data = isSearching ? filteredRestaurants : recentRestaurants;

    if (!isSearching && data.length === 0) {
      return (
        <EmptyState
          title="No recent searches"
          description="Start typing to find restaurants or explore quick actions"
          icon="time-outline"
        />
      );
    }

    return (
      <FlatList
        data={data}
        renderItem={renderRestaurantRow}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.listDivider} />}
        ListHeaderComponent={() => (
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>
              {isSearching ? 'Results' : 'Recents'}
            </Text>
          </View>
        )}
      />
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          {renderSegmentedControl()}
          {renderPrimaryInputs()}
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {renderSegmentedControl()}
        {renderPrimaryInputs()}
      </View>

      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.cardWhite,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  segmentedControl: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingHorizontal: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  segmentButton: {
    flex: 1,
    flexBasis: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  segmentButtonSpacing: {
    marginRight: spacing.lg,
  },
  segmentButtonInactive: {},
  segmentButtonActive: {
    borderBottomColor: colors.primary,
  },
  segmentLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  segmentLabelActive: {
    color: colors.primary,
  },
  segmentLabelInactive: {
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
    paddingTop: spacing.md,
  },
  listHeader: {
    marginBottom: spacing.sm,
  },
  locationInputContainer: {
    marginTop: spacing.md,
  },
  searchInput: {
    marginBottom: spacing.sm,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardWhite,
    borderRadius: spacing.borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    marginLeft: spacing.sm,
  },
  locationTextActive: {
    color: colors.textPrimary,
  },
  locationTextPlaceholder: {
    color: colors.textSecondary,
  },
  quickActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingRight: spacing.lg,
    gap: spacing.sm,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.xl,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    minHeight: 36,
    marginRight: spacing.sm,
  },
  quickActionButtonLast: {
    marginRight: 0,
  },
  quickActionIcon: {
    marginRight: spacing.xs,
  },
  quickActionLabel: {
    color: colors.textInverse,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  recentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: spacing.sm,
  },
  recentIcon: {
    marginRight: spacing.sm,
  },
  recentTextContainer: {
    flex: 1,
  },
  recentTitle: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  recentSubtitle: {
    marginTop: 2,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  listDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs,
  },
});
