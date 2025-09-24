import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { SearchBar, LoadingSpinner, EmptyState } from '../components';
import { MockDataService } from '../data/mockDataService';
import type { Restaurant } from '../data/mock/types';

export default function SearchScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [recentRestaurants, setRecentRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSegment, setActiveSegment] = useState<'Restaurants' | 'Members'>('Restaurants');
  const [location, setLocation] = useState('Current Location');

  const handleLocationPress = () => {};

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (activeSegment !== 'Restaurants') {
      setFilteredRestaurants([]);
      return;
    }

    filterRestaurants(searchQuery);
  }, [searchQuery, restaurants, activeSegment]);

  const loadRestaurants = async () => {
    try {
      const restaurantData = await MockDataService.getAllRestaurants();
      setRestaurants(restaurantData);
      setFilteredRestaurants(restaurantData);
      setRecentRestaurants(restaurantData.slice(0, 6));
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRestaurants = (query: string) => {
    if (!query.trim()) {
      setFilteredRestaurants(restaurants);
      return;
    }

    const queryLower = query.toLowerCase();
    const filtered = restaurants.filter(restaurant => {
      const matchesName = restaurant.name.toLowerCase().includes(queryLower);
      const matchesCuisine = Array.isArray(restaurant.cuisine)
        ? restaurant.cuisine.some(c => c.toLowerCase().includes(queryLower))
        : false;
      const neighborhood = restaurant.location?.neighborhood ?? '';
      const matchesNeighborhood = neighborhood.toLowerCase().includes(queryLower);

      return matchesName || matchesCuisine || matchesNeighborhood;
    });
    setFilteredRestaurants(filtered);
  };

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
    return (
      <View style={styles.recentRow}>
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
          <Pressable onPress={() => handleRemoveRecent(item.id)} hitSlop={8}>
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
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
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={searchPlaceholder}
          onClear={handleClearSearch}
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
      return (
        <EmptyState
          title="Search members"
          description="Find and follow friends by name or username"
          iconName="people-outline"
        />
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
          iconName="search-outline"
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
          iconName="time-outline"
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

  if (loading) {
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
