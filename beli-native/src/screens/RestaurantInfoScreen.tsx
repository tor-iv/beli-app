import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Image, Text as RNText, Animated } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { Screen, Text, Caption, Badge, LoadingSpinner, RestaurantScoreCard, Avatar } from '../components';
import { AddRestaurantModal, RestaurantSubmissionData, WhatToOrderModal } from '../components/modals';
import { RankingResultModal } from '../components/modals/RankingResultModal';
import { colors, spacing, theme } from '../theme';
import { useRestaurant, useCurrentUser } from '../lib/hooks';
import { MockDataService } from '../data/mockDataService';
import type { Restaurant, RankingResult } from '../types';
import type { AppStackParamList } from '../navigation/types';

type RestaurantInfoRouteProp = RouteProp<AppStackParamList, 'RestaurantInfo'>;
type RestaurantInfoNavigationProp = StackNavigationProp<AppStackParamList, 'RestaurantInfo'>;

const ACTION_BUTTONS: Array<{
  key: 'website' | 'call' | 'directions' | 'order';
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}> = [
  { key: 'order', icon: 'restaurant-outline', label: 'What to Order' },
  { key: 'website', icon: 'globe-outline', label: 'Website' },
  { key: 'call', icon: 'call-outline', label: 'Call' },
  { key: 'directions', icon: 'navigate-outline', label: 'Directions' },
];


const formatAddressLine = (restaurant: Restaurant): string => {
  const parts = [
    restaurant.location?.neighborhood,
    restaurant.location?.city,
    restaurant.location?.state,
  ].filter(Boolean);

  return parts.join(', ');
};

const getScoreColor = (score: number): string => {
  if (score >= 8.5) return colors.ratingExcellent;
  if (score >= 7.0) return colors.ratingGood;
  if (score >= 5.0) return colors.ratingAverage;
  return colors.ratingPoor;
};

const formatCount = (value?: number): string | undefined => {
  if (!value || value <= 0) {
    return undefined;
  }

  return new Intl.NumberFormat('en-US').format(value);
};

const getScoreSample = (value?: number): number | undefined => {
  if (!value || value <= 0) {
    return undefined;
  }

  return value;
};



// Tag component
interface TagProps {
  label: string;
}

const Tag: React.FC<TagProps> = ({ label }) => (
  <View style={styles.tag}>
    <RNText style={styles.tagText}>{label}</RNText>
  </View>
);

// Friends Avatar Stack component
interface AvatarStackProps {
  avatars: string[];
  count: number;
}

const AvatarStack: React.FC<AvatarStackProps> = ({ avatars, count }) => (
  <View style={styles.avatarStack}>
    {avatars.slice(0, 4).map((avatar, index) => (
      <View key={index} style={[styles.avatarWrapper, { zIndex: 4 - index }]}>
        <Avatar source={{ uri: avatar }} size="small" />
      </View>
    ))}
  </View>
);

// Popular Dishes Gallery
const PopularDishGallery: React.FC<{ images: string[] }> = ({ images }) => {
  const galleryImages = images.filter(Boolean);

  if (galleryImages.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.dishScrollContent}
    >
      {galleryImages.map((uri, index) => (
        <Image
          key={`${uri}-${index}`}
          source={{ uri }}
          style={[
            styles.dishImage,
            index === galleryImages.length - 1 && styles.dishImageLast,
          ]}
          resizeMode="cover"
        />
      ))}
    </ScrollView>
  );
};

const RestaurantInfoScreen: React.FC = () => {
  const navigation = useNavigation<RestaurantInfoNavigationProp>();
  const route = useRoute<RestaurantInfoRouteProp>();

  const { restaurantId } = route.params ?? { restaurantId: '' };

  // Data fetching with React Query hooks
  const { data: restaurant, isLoading: restaurantLoading } = useRestaurant(restaurantId);
  const { data: currentUser } = useCurrentUser();

  // UI state
  const [isSaved, setIsSaved] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [submissionData, setSubmissionData] = useState<RestaurantSubmissionData | null>(null);
  const [rankingResult, setRankingResult] = useState<RankingResult | null>(null);

  const scrollY = new Animated.Value(0);
  const loading = restaurantLoading;


  const popularImages = useMemo<string[]>(() => {
    if (!restaurant) {
      return [];
    }

    const primaryGallery = restaurant.popularDishImages?.filter(Boolean) ?? [];
    if (primaryGallery.length > 0) {
      return primaryGallery;
    }

    return restaurant.images?.filter(Boolean) ?? [];
  }, [restaurant]);

  const hasPopularImages = popularImages.length > 0;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddPress = () => {
    setShowAddModal(true);
  };

  const handleModalSubmit = (data: RestaurantSubmissionData) => {
    console.log('Restaurant submission data:', data);
    // TODO: Integrate with MockDataService to save the data
    setShowAddModal(false);
  };

  const handleRankingComplete = async (result: RankingResult, data: RestaurantSubmissionData) => {
    if (!currentUser || !restaurant) return;

    try {
      // Save the ranked restaurant to the user's list
      await MockDataService.insertRankedRestaurant(
        currentUser.id,
        restaurant.id,
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
    } catch (error) {
      console.error('Error saving ranked restaurant:', error);
    }
  };

  const handleResultDone = () => {
    // Close the result modal
    setShowResultModal(false);

    // Reset state
    setSubmissionData(null);
    setRankingResult(null);

    // Navigate back or refresh
    navigation.goBack();
  };

  const handleBookmarkPress = () => {
    setIsSaved(!isSaved);
    console.log('Bookmark pressed:', !isSaved);
  };

  const handlePrimaryAction = (action: 'website' | 'call' | 'directions' | 'order') => {
    switch (action) {
      case 'order':
        setShowOrderModal(true);
        break;
      case 'website':
        if (restaurant?.website) {
          console.log('Open website:', restaurant.website);
        }
        break;
      case 'call':
        if (restaurant?.phone) {
          console.log('Call:', restaurant.phone);
        }
        break;
      case 'directions':
        if (restaurant?.location) {
          console.log('Open directions to:', restaurant.location.address);
        }
        break;
      default:
        break;
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingState}>
          <LoadingSpinner size="large" />
        </View>
      </Screen>
    );
  }

  if (!restaurant) {
    return (
      <Screen>
        <View style={styles.emptyState}>
          <Text variant="h3" align="center">
            Restaurant not found
          </Text>
          <Caption align="center" color="textSecondary" style={styles.emptyCaption}>
            We couldn't find details for this restaurant.
          </Caption>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Text variant="button" color="textInverse">
              Go back
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const ratingCountLabel = formatCount(restaurant.ratingCount);
  const recScore = restaurant.scores?.recScore ?? restaurant.rating;
  const friendScore = restaurant.scores?.friendScore ?? restaurant.rating;
  const averageScore = restaurant.scores?.averageScore ?? restaurant.rating;

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Map Header */}
        {restaurant.location?.coordinates && (
          <Animated.View style={[
            styles.mapContainer,
            {
              transform: [{
                translateY: scrollY.interpolate({
                  inputRange: [0, 280],
                  outputRange: [0, -140],
                  extrapolate: 'clamp'
                })
              }]
            }
          ]}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: restaurant.location.coordinates.lat,
                longitude: restaurant.location.coordinates.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={true}
              zoomEnabled={true}
              rotateEnabled={false}
              pitchEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: restaurant.location.coordinates.lat,
                  longitude: restaurant.location.coordinates.lng,
                }}
                title={restaurant.name}
                description={`${restaurant.location.neighborhood} • ${restaurant.rating.toFixed(1)}`}
              />
            </MapView>

            {/* Header Navigation Overlay */}
            <Animated.View style={[
              styles.headerOverlay,
              {
                backgroundColor: scrollY.interpolate({
                  inputRange: [0, 50],
                  outputRange: ['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.95)'],
                  extrapolate: 'clamp'
                })
              }
            ]}>
              <Pressable style={styles.headerButton} onPress={handleBack}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </Pressable>

              <View style={styles.headerActions}>
                <Pressable style={styles.headerButton}>
                  <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
                </Pressable>
                <Pressable style={styles.headerButton}>
                  <Ionicons name="share-outline" size={24} color={colors.textPrimary} />
                </Pressable>
                <Pressable style={styles.headerButton}>
                  <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
                </Pressable>
              </View>
            </Animated.View>
          </Animated.View>
        )}

        {/* Main Content Card */}
        <View style={styles.contentCard}>


          {/* Restaurant Header */}
          <View style={styles.restaurantHeader}>
            <View style={styles.titleRow}>
              <RNText style={styles.restaurantName}>{restaurant.name}</RNText>
              <View style={styles.actionButtons}>
                <Pressable style={styles.actionIconButton} onPress={handleAddPress}>
                  <Ionicons name="add" size={24} color={colors.textPrimary} />
                </Pressable>
                <Pressable style={styles.actionIconButton} onPress={handleBookmarkPress}>
                  <Ionicons
                    name={isSaved ? "bookmark" : "bookmark-outline"}
                    size={24}
                    color={colors.textPrimary}
                  />
                </Pressable>
              </View>
            </View>
            <View style={styles.scoreRow}>
              <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(restaurant.rating) }]}>
                <RNText style={styles.scoreText}>{restaurant.rating.toFixed(1)}</RNText>
              </View>
              {ratingCountLabel && (
                <RNText style={styles.ratingCount}>({ratingCountLabel} ratings)</RNText>
              )}
            </View>
          </View>

          {/* Tags Section */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsContainer}
          >
            {restaurant.tags && restaurant.tags.map((tag, index) => (
              <Tag key={index} label={tag} />
            ))}
          </ScrollView>

          {/* Meta Info */}
          <View style={styles.metaSection}>
            <RNText style={styles.priceAndCuisine}>
              <RNText style={styles.priceText}>{restaurant.priceRange}</RNText>
              {' | '}
              {restaurant.cuisine.join(', ')}
            </RNText>
            <RNText style={styles.address}>
              {formatAddressLine(restaurant)}
            </RNText>
          </View>

          {/* Social Proof */}
          {restaurant.friendsWantToTryCount && (
            <View style={styles.socialProof}>
              {restaurant.friendAvatars && (
                <AvatarStack
                  avatars={restaurant.friendAvatars}
                  count={restaurant.friendsWantToTryCount}
                />
              )}
              <RNText style={styles.friendsText}>
                <RNText style={styles.friendsCount}>
                  {restaurant.friendsWantToTryCount}
                </RNText>
                {' '}
                friend{restaurant.friendsWantToTryCount === 1 ? '' : 's'} want to try
              </RNText>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActionsRow}>
            {ACTION_BUTTONS.map(({ key, label, icon }) => {
              const isDisabled =
                (key === 'website' && !restaurant.website) ||
                (key === 'call' && !restaurant.phone) ||
                (key === 'directions' && !restaurant.location) ||
                (key === 'order' && !restaurant.menu);

              return (
                <Pressable
                  key={key}
                  style={({ pressed }) => [
                    styles.quickActionButton,
                    pressed && styles.quickActionButtonPressed,
                    isDisabled && styles.quickActionButtonDisabled,
                  ]}
                  onPress={() => handlePrimaryAction(key)}
                  disabled={isDisabled}
                >
                  <Ionicons
                    name={icon}
                    size={20}
                    color={isDisabled ? colors.textTertiary : colors.primary}
                  />
                  <RNText style={
                    isDisabled
                      ? [styles.quickActionLabel, styles.quickActionLabelDisabled]
                      : styles.quickActionLabel
                  }>
                    {label}
                  </RNText>
                </Pressable>
              );
            })}
          </View>

          {/* Scores Section */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <RNText style={styles.sectionTitle}>Scores</RNText>
              <View style={styles.scBadge}>
                <RNText style={styles.scBadgeText}>SC</RNText>
              </View>
            </View>
            <Pressable>
              <RNText style={styles.sectionLink}>See all scores</RNText>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scoresContainer}
            style={styles.scoresScrollView}
          >
            <RestaurantScoreCard
              score={recScore}
              title="Rec Score"
              description="How much we think you will like it"
              sampleSize={getScoreSample(restaurant.scores?.recScoreSampleSize)}
              accentColor={getScoreColor(recScore)}
            />
            <RestaurantScoreCard
              score={friendScore}
              title="Friend Score"
              description="What your friends think"
              sampleSize={getScoreSample(restaurant.scores?.friendScoreSampleSize)}
              accentColor={getScoreColor(friendScore)}
            />
            <RestaurantScoreCard
              score={averageScore}
              title="Average Score"
              description="Community average"
              sampleSize={getScoreSample(
                restaurant.scores?.averageScoreSampleSize ?? restaurant.ratingCount
              )}
              accentColor={getScoreColor(averageScore)}
            />
          </ScrollView>

          {/* Popular Dishes */}
          {hasPopularImages && (
            <>
              <View style={styles.sectionHeader}>
                <RNText style={styles.sectionTitle}>Popular dishes</RNText>
                <Pressable>
                  <RNText style={styles.sectionLink}>See all photos</RNText>
                </Pressable>
              </View>
              <PopularDishGallery images={popularImages} />
            </>
          )}

          <View style={styles.bottomSpacer} />
        </View>
      </Animated.ScrollView>

      {/* Add Restaurant Modal */}
      {restaurant && currentUser && (
        <AddRestaurantModal
          visible={showAddModal}
          restaurant={restaurant}
          userId={currentUser.id}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleModalSubmit}
          onRankingComplete={handleRankingComplete}
        />
      )}

      {/* Ranking Result Modal */}
      {restaurant && currentUser && rankingResult && (
        <RankingResultModal
          visible={showResultModal}
          restaurant={restaurant}
          user={currentUser}
          result={rankingResult}
          notes={submissionData?.notes}
          photos={submissionData?.photos}
          onClose={() => setShowResultModal(false)}
          onDone={handleResultDone}
        />
      )}

      {/* What to Order Modal */}
      {restaurant && (
        <WhatToOrderModal
          visible={showOrderModal}
          restaurant={restaurant}
          onClose={() => setShowOrderModal(false)}
        />
      )}
    </View>
  );
};

export default RestaurantInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    backgroundColor: colors.background,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  emptyCaption: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 88,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 44,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  contentCard: {
    backgroundColor: colors.cardWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -40,
    paddingTop: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  restaurantHeader: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  restaurantName: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    flex: 1,
    marginRight: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardWhite,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  scoreText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
  ratingCount: {
    color: colors.textSecondary,
    fontSize: 14,
    opacity: 0.8,
  },
  tagsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  tag: {
    backgroundColor: '#F2F2F7',
    borderRadius: 18,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C3C43',
  },
  metaSection: {
    marginTop: 16,
  },
  priceAndCuisine: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  priceText: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  address: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 22,
  },
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  avatarWrapper: {
    marginLeft: -8,
    borderWidth: 2,
    borderColor: colors.cardWhite,
    borderRadius: 16,
  },
  friendsText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  friendsCount: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '500',
  },
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    gap: 12,
  },
  quickActionButton: {
    minWidth: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    gap: 8,
  },
  quickActionButtonPressed: {
    backgroundColor: '#F2F2F7',
  },
  quickActionButtonDisabled: {
    opacity: 0.5,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  quickActionLabelDisabled: {
    color: colors.textTertiary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  scBadge: {
    backgroundColor: '#E8F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  sectionLink: {
    fontSize: 15,
    color: colors.primary,
  },
  scoresScrollView: {
    overflow: 'visible',
  },
  scoresContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingVertical: 8,
    gap: 12,
  },
  dishScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 12,
  },
  dishImage: {
    width: 240,
    height: 180,
    borderRadius: 12,
    backgroundColor: colors.borderLight,
  },
  dishImageLast: {
    marginRight: 0,
  },
  bottomSpacer: {
    height: 48,
  },
  mapContainer: {
    height: 280,
    backgroundColor: colors.cardWhite,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
});
