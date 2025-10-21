import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import type { Restaurant, User } from '../../types';

interface AddRestaurantModalProps {
  visible: boolean;
  restaurant: Restaurant;
  onClose: () => void;
  onSubmit: (data: RestaurantSubmissionData) => void;
}

export interface RestaurantSubmissionData {
  rating: 'liked' | 'fine' | 'disliked';
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

export const AddRestaurantModal: React.FC<AddRestaurantModalProps> = ({
  visible,
  restaurant,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState<'liked' | 'fine' | 'disliked'>('liked');
  const [listType, setListType] = useState<'restaurants' | 'bars' | 'bakeries' | 'coffee_tea' | 'dessert' | 'other'>('restaurants');
  const [showListTypePicker, setShowListTypePicker] = useState(false);
  const [companions, setCompanions] = useState<string[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [favoriteDishes, setFavoriteDishes] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [visitDate, setVisitDate] = useState<Date | null>(null);
  const [stealthMode, setStealthMode] = useState(false);

  const handleSubmit = () => {
    onSubmit({
      rating,
      listType,
      companions,
      labels,
      notes,
      favoriteDishes,
      photos,
      visitDate,
      stealthMode,
    });
    onClose();
  };

  const selectedListTypeLabel = LIST_TYPE_OPTIONS.find(opt => opt.key === listType)?.label || 'Restaurants';
  const selectedListTypeIcon = LIST_TYPE_OPTIONS.find(opt => opt.key === listType)?.icon || 'restaurant';

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
              onPress={() => setShowListTypePicker(true)}
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
                  onPress={() => setRating(option.key)}
                >
                  <View
                    style={[
                      styles.ratingCircle,
                      { backgroundColor: option.color },
                      rating === option.key && styles.ratingCircleSelected,
                    ]}
                  >
                    {rating === option.key && (
                      <Ionicons name="checkmark" size={32} color="white" />
                    )}
                  </View>
                  <Text style={styles.ratingLabel}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Additional Options */}
          <View style={styles.optionsList}>
            {/* Who did you go with */}
            <Pressable style={styles.optionRow}>
              <Ionicons name="people-outline" size={24} color={colors.textPrimary} />
              <Text style={styles.optionLabel}>Who did you go with?</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </Pressable>

            {/* Add labels */}
            <Pressable style={styles.optionRow}>
              <Ionicons name="pricetag-outline" size={24} color={colors.textPrimary} />
              <View style={styles.optionLabelContainer}>
                <Text style={styles.optionLabel}>Add labels (good for, etc.)</Text>
                <View style={styles.scBadge}>
                  <Text style={styles.scBadgeText}>SC</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </Pressable>

            {/* Add notes */}
            <Pressable style={styles.optionRow}>
              <Ionicons name="create-outline" size={24} color={colors.textPrimary} />
              <Text style={styles.optionLabel}>Add notes</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </Pressable>

            {/* Add favorite dishes */}
            <Pressable style={styles.optionRow}>
              <Ionicons name="restaurant-outline" size={24} color={colors.textPrimary} />
              <Text style={styles.optionLabel}>Add favorite dishes</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </Pressable>

            {/* Add photos */}
            <Pressable style={styles.optionRow}>
              <Ionicons name="camera-outline" size={24} color={colors.textPrimary} />
              <Text style={styles.optionLabel}>Add photos</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </Pressable>

            {/* Add visit date */}
            <Pressable style={styles.optionRow}>
              <Ionicons name="calendar-outline" size={24} color={colors.textPrimary} />
              <Text style={styles.optionLabel}>Add visit date</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </Pressable>

            {/* Stealth mode */}
            <View style={styles.optionRow}>
              <Ionicons name="lock-closed-outline" size={24} color={colors.textPrimary} />
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

          {/* Bottom Button */}
          <View style={styles.bottomButtonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
              ]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Rank it!</Text>
            </Pressable>
          </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 8,
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  restaurantMeta: {
    fontSize: 15,
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 16,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  listTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: 12,
    gap: 8,
  },
  listTypeText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  ratingButtonContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  ratingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingCircleSelected: {
    borderWidth: 3,
    borderColor: colors.textPrimary,
  },
  ratingLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  optionsList: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 12,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
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
    paddingBottom: 32,
    paddingTop: 16,
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
  submitButtonText: {
    fontSize: 18,
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
