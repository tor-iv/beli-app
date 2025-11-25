import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export type TasteProfileCategory = 'cuisines' | 'cities' | 'countries';

interface TasteProfileCategoryTabProps {
  activeCategory: TasteProfileCategory;
  onCategoryChange: (category: TasteProfileCategory) => void;
}

const CATEGORIES: Array<{ id: TasteProfileCategory; label: string }> = [
  { id: 'cuisines', label: 'Cuisines' },
  { id: 'cities', label: 'Cities' },
  { id: 'countries', label: 'Countries' },
];

export const TasteProfileCategoryTab: React.FC<TasteProfileCategoryTabProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <View style={styles.container}>
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category.id;

        return (
          <TouchableOpacity
            key={category.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onCategoryChange(category.id)}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {category.label}
            </Text>
            {isActive && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.xs,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: spacing.borderRadius.md,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: colors.backgroundSecondary,
  },
  tabText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: colors.textPrimary,
    borderRadius: 1,
  },
});
