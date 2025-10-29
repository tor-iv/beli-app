import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import type { Restaurant, ListCategory, InitialSentiment, RankingState, RankingResult } from '../../types';
import { MockDataService } from '../../data/mockDataService';
import {
  initializeRanking,
  getNextComparison,
  processComparison,
  undoLastComparison,
  getRankingProgress,
  generateRankingResult,
} from '../../utils/binarySearchRanking';

interface AddRestaurantModalProps {
  visible: boolean;
  restaurant: Restaurant;
  userId: string;
  onClose: () => void;
  onSubmit: (data: RestaurantSubmissionData) => void;
  onRankingComplete?: (result: RankingResult, data: RestaurantSubmissionData) => void;
}

export interface RestaurantSubmissionData {
  rating: 'liked' | 'fine' | 'disliked' | null;
  listType: 'restaurants' | 'bars' | 'bakeries' | 'coffee_tea' | 'dessert' | 'other';
  companions: string[];
  labels: string[];
  notes: string;
  favoriteDishes: string[];
  photos: string[];
  visitDate: Date | null;
  stealthMode: boolean;
}

type RatingOption = {
  key: 'liked' | 'fine' | 'disliked';
  label: string;
  color: string;
};

const RATING_OPTIONS: RatingOption[] = [
  { key: 'liked', label: 'I liked it!', color: colors.ratingExcellent },
  { key: 'fine', label: 'It was fine', color: '#F5DC9E' },
  { key: 'disliked', label: "I didn't like it", color: '#F5C1C1' },
];

const LIST_TYPE_OPTIONS = [
  { key: 'restaurants' as const, label: 'Restaurants', icon: 'restaurant' as const },
  { key: 'bars' as const, label: 'Bars', icon: 'wine' as const },
  { key: 'bakeries' as const, label: 'Bakeries', icon: 'cafe' as const },
  { key: 'coffee_tea' as const, label: 'Coffee & Tea', icon: 'cafe-outline' as const },
  { key: 'dessert' as const, label: 'Dessert', icon: 'ice-cream' as const },
  { key: 'other' as const, label: 'Other', icon: 'ellipsis-horizontal' as const },
];

type ModalMode = 'initial' | 'ranking';

export const AddRestaurantModal: React.FC<AddRestaurantModalProps> = ({
  visible,
  restaurant,
  userId,
  onClose,
  onSubmit,
  onRankingComplete,
}) => {
  const [modalMode, setModalMode] = useState<ModalMode>('initial');
  const [rating, setRating] = useState<'liked' | 'fine' | 'disliked' | null>(null);
  const [listType, setListType] = useState<ListCategory>('restaurants');
  const [showListTypePicker, setShowListTypePicker] = useState(false);
  const [companions, setCompanions] = useState<string[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [favoriteDishes, setFavoriteDishes] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [visitDate, setVisitDate] = useState<Date | null>(null);
  const [stealthMode, setStealthMode] = useState(false);

  // Ranking state
  const [rankingState, setRankingState] = useState<RankingState | null>(null);
  const [currentComparison, setCurrentComparison] = useState<Restaurant | null>(null);
  const [loadingRanking, setLoadingRanking] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      // Reset all state
      setModalMode('initial');
      setRating(null);
      setListType('restaurants');
      setCompanions([]);
      setLabels([]);
      setNotes('');
      setFavoriteDishes([]);
      setPhotos([]);
      setVisitDate(null);
      setStealthMode(false);
      setRankingState(null);
      setCurrentComparison(null);
      setLoadingRanking(false);
    }
  }, [visible]);

  const startRankingFlow = async () => {
    if (!rating || !onRankingComplete) return;

    setLoadingRanking(true);
    try {
      // Get ranked list for this category
      const rankedList = await MockDataService.getRankedRestaurants(userId, listType);

      // Initialize ranking state
      const state = initializeRanking(
        restaurant.id,
        listType,
        rankedList,
        rating as InitialSentiment
      );

      setRankingState(state);

      // Get first comparison
      const nextRestaurant = getNextComparison(state);
      setCurrentComparison(nextRestaurant);

      // Switch to ranking mode
      setModalMode('ranking');
    } catch (error) {
      console.error('Error initializing ranking:', error);
    } finally {
      setLoadingRanking(false);
    }
  };

  const handleComparisonChoice = (choice: 'left' | 'right') => {
    if (!rankingState || !currentComparison) return;

    // Process the comparison
    const newState = processComparison(rankingState, currentComparison, choice);
    setRankingState(newState);

    // Check if complete
    if (newState.isComplete) {
      handleRankingComplete(newState);
      return;
    }

    // Get next comparison
    const nextRestaurant = getNextComparison(newState);
    setCurrentComparison(nextRestaurant);
  };

  const handleSkip = () => {
    if (!rankingState || !currentComparison || rankingState.skipsRemaining <= 0) return;

    const newState = processComparison(rankingState, currentComparison, 'skip');
    setRankingState(newState);

    if (newState.isComplete) {
      handleRankingComplete(newState);
      return;
    }

    const nextRestaurant = getNextComparison(newState);
    setCurrentComparison(nextRestaurant);
  };

  const handleUndo = () => {
    if (!rankingState || rankingState.comparisonHistory.length === 0) return;

    const newState = undoLastComparison(rankingState);
    setRankingState(newState);

    // Get the comparison restaurant again
    const nextRestaurant = getNextComparison(newState);
    setCurrentComparison(nextRestaurant);
  };

  const handleRankingComplete = (state: RankingState) => {
    if (!onRankingComplete) return;

    // Generate final result
    const result = generateRankingResult(state);

    // Create submission data
    const data: RestaurantSubmissionData = {
      rating,
      listType,
      companions,
      labels,
      notes,
      favoriteDishes,
      photos,
      visitDate,
      stealthMode,
    };

    // Call the completion callback
    onRankingComplete(result, data);
  };

  const handleRankIt = () => {
    if (onRankingComplete && rating !== null) {
      // Start the ranking flow
      startRankingFlow();
    } else {
      // Old behavior - just submit
      const data: RestaurantSubmissionData = {
        rating,
        listType,
        companions,
        labels,
        notes,
        favoriteDishes,
        photos,
        visitDate,
        stealthMode,
      };
      onSubmit(data);
      onClose();
    }
  };

  const selectedListTypeLabel = LIST_TYPE_OPTIONS.find(opt => opt.key === listType)?.label || 'Restaurants';
  const selectedListTypeIcon = LIST_TYPE_OPTIONS.find(opt => opt.key === listType)?.icon || 'restaurant';

  const progress = rankingState ? getRankingProgress(rankingState) : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <Text style={styles.restaurantMeta}>
                {restaurant.priceRange} | {restaurant.cuisine.join(', ')}
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.textPrimary} />
            </Pressable>
          </View>

          {/* List Type Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Add to my list of</Text>
            <Pressable
              style={styles.listTypeButton}
              onPress={() => modalMode === 'initial' && setShowListTypePicker(true)}
              disabled={modalMode === 'ranking'}
            >
              <Ionicons name={selectedListTypeIcon} size={20} color={colors.textPrimary} />
              <Text style={styles.listTypeText}>{selectedListTypeLabel}</Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Rating Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How was it?</Text>
            <View style={styles.ratingButtons}>
              {RATING_OPTIONS.map((option) => (
                <Pressable
                  key={option.key}
                  style={styles.ratingButtonContainer}
                  onPress={() => modalMode === 'initial' && setRating(option.key)}
                  disabled={modalMode === 'ranking'}
                >
                  <View
                    style={[
                      styles.ratingCircle,
                      { backgroundColor: option.color },
                      rating === option.key && styles.ratingCircleSelected,
                    ]}
                  >
                    {rating === option.key && (
                      <Ionicons name="checkmark" size={28} color="white" />
                    )}
                  </View>
                  <Text style={styles.ratingLabel}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Ranking Section - Only show when in ranking mode */}
          {modalMode === 'ranking' && rankingState && currentComparison && (
            <View style={styles.section}>
              <Text style={styles.rankingTitle}>Which do you prefer?</Text>

              <View style={styles.comparisonContainer}>
                {/* Left Card - Target Restaurant */}
                <Pressable
                  style={styles.comparisonCard}
                  onPress={() => handleComparisonChoice('left')}
                >
                  <Text style={styles.comparisonCardName} numberOfLines={2}>
                    {restaurant.name}
                  </Text>
                  <Text style={styles.comparisonCardLocation} numberOfLines={1}>
                    {restaurant.location.city}, {restaurant.location.state}
                  </Text>
                </Pressable>

                {/* OR Divider */}
                <View style={styles.orCircle}>
                  <Text style={styles.orText}>OR</Text>
                </View>

                {/* Right Card - Comparison Restaurant */}
                <Pressable
                  style={styles.comparisonCard}
                  onPress={() => handleComparisonChoice('right')}
                >
                  <Text style={styles.comparisonCardName} numberOfLines={2}>
                    {currentComparison.name}
                  </Text>
                  <Text style={styles.comparisonCardLocation} numberOfLines={1}>
                    {currentComparison.location.city}, {currentComparison.location.state}
                    {currentComparison.rating && ` • ${currentComparison.rating.toFixed(1)}`}
                  </Text>
                </Pressable>
              </View>

              {/* Progress indicator */}
              {progress && (
                <Text style={styles.progressText}>
                  Comparison {progress.currentComparison} of ~{progress.estimatedTotal}
                </Text>
              )}
            </View>
          )}

          {/* Ranking Controls - Only show when in ranking mode */}
          {modalMode === 'ranking' && rankingState && (
            <View style={styles.section}>
              <View style={styles.rankingControls}>
                <Pressable
                  style={[
                    styles.controlButton,
                    rankingState.comparisonHistory.length === 0 && styles.controlButtonDisabled,
                  ]}
                  onPress={handleUndo}
                  disabled={rankingState.comparisonHistory.length === 0}
                >
                  <Ionicons
                    name="arrow-undo"
                    size={18}
                    color={
                      rankingState.comparisonHistory.length === 0
                        ? colors.textTertiary
                        : colors.textPrimary
                    }
                  />
                  <Text style={[
                    styles.controlButtonText,
                    rankingState.comparisonHistory.length === 0 && styles.controlButtonTextDisabled,
                  ]}>
                    Undo
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.tooToughButton,
                    rankingState.skipsRemaining === 0 && styles.controlButtonDisabled,
                  ]}
                  onPress={handleSkip}
                  disabled={rankingState.skipsRemaining === 0}
                >
                  <Text style={[
                    styles.tooToughButtonText,
                    rankingState.skipsRemaining === 0 && styles.controlButtonTextDisabled,
                  ]}>
                    Too tough
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.controlButton,
                    rankingState.skipsRemaining === 0 && styles.controlButtonDisabled,
                  ]}
                  onPress={handleSkip}
                  disabled={rankingState.skipsRemaining === 0}
                >
                  <Text style={[
                    styles.controlButtonText,
                    rankingState.skipsRemaining === 0 && styles.controlButtonTextDisabled,
                  ]}>
                    Skip
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={
                      rankingState.skipsRemaining === 0
                        ? colors.textTertiary
                        : colors.textPrimary
                    }
                  />
                </Pressable>
              </View>
            </View>
          )}

          {/* Additional Options - Only show in initial mode after rating is selected */}
          {modalMode === 'initial' && rating !== null && (
            <View style={styles.optionsList}>
              <Pressable style={styles.optionRow}>
                <Ionicons name="people-outline" size={22} color={colors.textPrimary} />
                <Text style={styles.optionLabel}>Who did you go with?</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </Pressable>

              <Pressable style={styles.optionRow}>
                <Ionicons name="pricetag-outline" size={22} color={colors.textPrimary} />
                <View style={styles.optionLabelContainer}>
                  <Text style={styles.optionLabel}>Add labels (good for, etc.)</Text>
                  <View style={styles.scBadge}>
                    <Text style={styles.scBadgeText}>SC</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </Pressable>

              <Pressable style={styles.optionRow}>
                <Ionicons name="create-outline" size={22} color={colors.textPrimary} />
                <Text style={styles.optionLabel}>Add notes</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </Pressable>

              <Pressable style={styles.optionRow}>
                <Ionicons name="restaurant-outline" size={22} color={colors.textPrimary} />
                <Text style={styles.optionLabel}>Add favorite dishes</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </Pressable>

              <Pressable style={styles.optionRow}>
                <Ionicons name="camera-outline" size={22} color={colors.textPrimary} />
                <Text style={styles.optionLabel}>Add photos</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </Pressable>

              <Pressable style={styles.optionRow}>
                <Ionicons name="calendar-outline" size={22} color={colors.textPrimary} />
                <Text style={styles.optionLabel}>Add visit date</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </Pressable>

              <View style={styles.optionRow}>
                <Ionicons name="lock-closed-outline" size={22} color={colors.textPrimary} />
                <View style={styles.stealthContainer}>
                  <View style={styles.stealthLabelContainer}>
                    <Text style={styles.optionLabel}>Stealth mode</Text>
                    <View style={styles.scBadge}>
                      <Text style={styles.scBadgeText}>SC</Text>
                    </View>
                  </View>
                  <Text style={styles.stealthDescription}>
                    Hide this activity from newsfeed
                  </Text>
                </View>
                <Switch
                  value={stealthMode}
                  onValueChange={setStealthMode}
                  trackColor={{ false: colors.borderLight, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
            </View>
          )}

          {/* Bottom Button - Only show in initial mode */}
          {modalMode === 'initial' && (
            <View style={styles.bottomButtonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.submitButtonPressed,
                  loadingRanking && styles.submitButtonDisabled,
                ]}
                onPress={handleRankIt}
                disabled={loadingRanking}
              >
                {loadingRanking ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Rank it!</Text>
                )}
              </Pressable>
            </View>
          )}
        </ScrollView>

        {/* List Type Picker Modal */}
        <Modal
          visible={showListTypePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowListTypePicker(false)}
        >
          <View style={styles.pickerModalContainer}>
            <Pressable
              style={styles.pickerBackdrop}
              onPress={() => setShowListTypePicker(false)}
            />
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHandle} />
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Choose a category</Text>
                <Pressable onPress={() => setShowListTypePicker(false)}>
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </Pressable>
              </View>
              <View style={styles.pickerOptions}>
                {LIST_TYPE_OPTIONS.map((option) => (
                  <Pressable
                    key={option.key}
                    style={[
                      styles.pickerOption,
                      listType === option.key && styles.pickerOptionSelected,
                    ]}
                    onPress={() => {
                      setListType(option.key);
                      setShowListTypePicker(false);
                    }}
                  >
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={listType === option.key ? colors.white : colors.textPrimary}
                    />
                    <Text
                      style={[
                        styles.pickerOptionText,
                        listType === option.key && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 6,
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  restaurantMeta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  listTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: 12,
    gap: 8,
  },
  listTypeText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  ratingButtonContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  ratingCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingCircleSelected: {
    borderWidth: 3,
    borderColor: colors.textPrimary,
  },
  ratingLabel: {
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  // Ranking styles
  rankingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: -20,
  },
  comparisonCard: {
    width: '45%',
    aspectRatio: 0.85,
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
  },
  comparisonCardName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    lineHeight: 28,
    textAlign: 'center',
  },
  comparisonCardLocation: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
  orCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    marginHorizontal: -10,
  },
  orText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  progressText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  rankingControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  controlButtonDisabled: {
    opacity: 0.4,
  },
  controlButtonText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  controlButtonTextDisabled: {
    color: colors.textTertiary,
  },
  tooToughButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: 20,
  },
  tooToughButtonText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  // Additional options
  optionsList: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 12,
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  optionLabelContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stealthContainer: {
    flex: 1,
  },
  stealthLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stealthDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  scBadge: {
    backgroundColor: '#E8F5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  scBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  bottomButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonPressed: {
    opacity: 0.8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  // List Type Picker Styles
  pickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  pickerHandle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderMedium,
    marginTop: 12,
    marginBottom: 16,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  pickerOptions: {
    paddingHorizontal: 20,
    gap: 12,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.white,
    gap: 12,
  },
  pickerOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pickerOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  pickerOptionTextSelected: {
    color: colors.white,
  },
});
