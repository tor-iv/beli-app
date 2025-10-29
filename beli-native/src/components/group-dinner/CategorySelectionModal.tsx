import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { ListCategory } from '../../types';

interface CategorySelectionModalProps {
  visible: boolean;
  selectedCategory: ListCategory | null;
  onSelectCategory: (category: ListCategory) => void;
  onClose: () => void;
}

interface CategoryOption {
  key: ListCategory;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { key: 'restaurants', label: 'Restaurants', icon: 'restaurant-outline' },
  { key: 'bars', label: 'Bars', icon: 'wine-outline' },
  { key: 'bakeries', label: 'Bakeries', icon: 'ice-cream-outline' },
  { key: 'coffee_tea', label: 'Coffee & Tea', icon: 'cafe-outline' },
  { key: 'dessert', label: 'Dessert', icon: 'ice-cream-outline' },
];

export const CategorySelectionModal: React.FC<CategorySelectionModalProps> = ({
  visible,
  selectedCategory,
  onSelectCategory,
  onClose,
}) => {
  const handleSelectCategory = (category: ListCategory) => {
    onSelectCategory(category);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Choose a category</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {CATEGORY_OPTIONS.map((option) => {
            const isSelected = selectedCategory === option.key;
            return (
              <Pressable
                key={option.key}
                style={[
                  styles.categoryOption,
                  isSelected && styles.categoryOptionSelected,
                ]}
                onPress={() => handleSelectCategory(option.key)}
              >
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={isSelected ? colors.background : colors.textPrimary}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    isSelected && styles.categoryLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 0,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.md,
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium as any,
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  categoryLabelSelected: {
    color: colors.background,
  },
});
