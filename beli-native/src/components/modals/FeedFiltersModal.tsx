import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

export interface FeedFilters {
  rankingsOnly: boolean;
  topRatedOnly: boolean;
  restaurantsOnly: boolean;
}

interface FeedFiltersModalProps {
  visible: boolean;
  filters: FeedFilters;
  onClose: () => void;
  onApply: (filters: FeedFilters) => void;
}

export const FeedFiltersModal: React.FC<FeedFiltersModalProps> = ({
  visible,
  filters,
  onClose,
  onApply,
}) => {
  const [localFilters, setLocalFilters] = useState<FeedFilters>(filters);

  // Update local state when filters prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, visible]);

  const toggleFilter = (key: keyof FeedFilters) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleClearAll = () => {
    setLocalFilters({
      rankingsOnly: false,
      topRatedOnly: false,
      restaurantsOnly: false,
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const renderCheckbox = (
    label: string,
    key: keyof FeedFilters,
    description?: string
  ) => (
    <Pressable
      style={styles.checkboxRow}
      onPress={() => toggleFilter(key)}
    >
      <View style={styles.checkboxLeft}>
        <Text style={styles.checkboxLabel}>{label}</Text>
        {description && (
          <Text style={styles.checkboxDescription}>{description}</Text>
        )}
      </View>
      <Ionicons
        name={localFilters[key] ? 'checkmark-circle' : 'checkmark-circle-outline'}
        size={28}
        color={localFilters[key] ? colors.primary : colors.textTertiary}
      />
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>Filter feed</Text>
                <View style={styles.scBadge}>
                  <Text style={styles.scText}>SC</Text>
                </View>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </Pressable>
            </View>

            {/* Filter Options */}
            <View style={styles.filtersContainer}>
              {renderCheckbox(
                'Rankings only',
                'rankingsOnly',
                'Show only posts with restaurant rankings'
              )}
              {renderCheckbox(
                'Top rated (>9)',
                'topRatedOnly',
                'Show only excellent ratings (9.0+)'
              )}
              {renderCheckbox(
                'Restaurants only',
                'restaurantsOnly',
                'Exclude bars, bakeries, and other categories'
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionBar}>
              <Pressable onPress={handleClearAll}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </Pressable>
              <Pressable style={styles.applyButton} onPress={handleApply}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: spacing.borderRadius.xl,
    borderTopRightRadius: spacing.borderRadius.xl,
    maxHeight: '80%',
  },
  modalContent: {
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
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
  closeButton: {
    padding: spacing.xs,
  },
  filtersContainer: {
    paddingTop: spacing.lg,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  checkboxLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  checkboxLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  checkboxDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  clearAllText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
  applyButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.xl,
    paddingHorizontal: spacing.xl * 2,
    paddingVertical: spacing.md,
  },
  applyButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
});
