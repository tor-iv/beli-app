import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface CategoryPillsProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const CATEGORIES = [
  { key: 'All', label: 'All' },
  { key: 'pizza', label: 'Pizza' },
  { key: 'fine-dining', label: 'Fine Dining' },
  { key: 'budget-friendly', label: 'Budget Friendly' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'ramen', label: 'Ramen' },
  { key: 'street-food', label: 'Street Food' },
  { key: 'brunch', label: 'Brunch' },
];

export default function CategoryPills({
  selectedCategory,
  onCategorySelect,
}: CategoryPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {CATEGORIES.map((category) => {
        const isActive = selectedCategory === category.key;
        return (
          <Pressable
            key={category.key}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onCategorySelect(category.key)}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    marginBottom: spacing.md,
    minHeight: 40,
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
  },
  pill: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: spacing.sm,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.white,
  },
});
