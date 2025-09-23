import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface CategoryOption {
  id: string;
  label: string;
}

interface CategoryDropdownProps {
  categories: CategoryOption[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  style?: ViewStyle;
  testID?: string;
}

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  style,
  testID,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCategoryLabel = categories.find(cat => cat.id === selectedCategory)?.label || 'Select';

  const handleCategorySelect = (categoryId: string) => {
    onCategoryChange(categoryId);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Pressable style={styles.dropdown} onPress={() => setIsOpen(true)}>
        <Text style={styles.selectedText}>{selectedCategoryLabel}</Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={theme.colors.textSecondary}
        />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)} />

          <View style={styles.sheetContainer}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Choose a category</Text>
              <Pressable onPress={() => setIsOpen(false)} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.categoryGrid}
              showsVerticalScrollIndicator={false}
            >
              {categories.map((category) => {
                const isSelected = category.id === selectedCategory;

                return (
                  <Pressable
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      isSelected && styles.categoryButtonSelected,
                    ]}
                    onPress={() => handleCategorySelect(category.id)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonLabel,
                        isSelected && styles.categoryButtonLabelSelected,
                      ]}
                    >
                      {category.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },

  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.white,
  },

  selectedText: {
    fontSize: 32,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginRight: theme.spacing.xs,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000055',
  },

  sheetContainer: {
    backgroundColor: theme.colors.white,
    paddingBottom: theme.spacing.lg,
    borderTopLeftRadius: theme.spacing.borderRadius.xl,
    borderTopRightRadius: theme.spacing.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
  },

  sheetHandle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.borderMedium,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },

  sheetTitle: {
    fontSize: 18,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },

  closeButton: {
    padding: theme.spacing.xs,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.lg,
  },

  categoryButton: {
    width: '48%',
    marginBottom: theme.spacing.md,
    borderRadius: theme.spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderMedium,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
  },

  categoryButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },

  categoryButtonLabel: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold,
    textAlign: 'center',
  },

  categoryButtonLabelSelected: {
    color: theme.colors.white,
  },
});
