import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import type { SortOption } from '../profile/TasteProfileList';

interface SortOptionsModalProps {
  visible: boolean;
  currentSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
  onClose: () => void;
}

const SORT_OPTIONS: Array<{ id: SortOption; label: string }> = [
  { id: 'count', label: 'Count' },
  { id: 'avgScore', label: 'Avg. Score' },
];

export const SortOptionsModal: React.FC<SortOptionsModalProps> = ({
  visible,
  currentSort,
  onSelectSort,
  onClose,
}) => {
  const handleSelectSort = (sortId: SortOption) => {
    onSelectSort(sortId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.modal}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Sort By</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Options */}
              <View style={styles.options}>
                {SORT_OPTIONS.map((option, index) => {
                  const isSelected = currentSort === option.id;
                  const isLast = index === SORT_OPTIONS.length - 1;

                  return (
                    <View key={option.id}>
                      <TouchableOpacity
                        style={styles.option}
                        onPress={() => handleSelectSort(option.id)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color={colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                      {!isLast && <View style={styles.separator} />}
                    </View>
                  );
                })}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: spacing.borderRadius.xl,
    borderTopRightRadius: spacing.borderRadius.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  options: {
    paddingHorizontal: spacing.lg,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  optionText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
});
