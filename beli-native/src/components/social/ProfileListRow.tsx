import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

interface ProfileListRowProps {
  icon: 'checkmark-circle' | 'bookmark' | 'heart' | 'people';
  label: string;
  count?: number;
  onPress?: () => void;
  isLast?: boolean;
}

export const ProfileListRow: React.FC<ProfileListRowProps> = ({
  icon,
  label,
  count,
  onPress,
  isLast = false,
}) => {
  // Map filled icons to outline variants
  const iconMap: Record<string, any> = {
    'checkmark-circle': 'checkmark-circle-outline',
    'bookmark': 'bookmark-outline',
    'heart': 'heart-outline',
    'people': 'people-outline',
  };

  const outlineIcon = iconMap[icon] || icon;

  return (
    <TouchableOpacity
      style={[styles.container, isLast && styles.lastContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <Ionicons
          name={outlineIcon}
          size={24}
          color={colors.textPrimary}
          style={styles.icon}
        />
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.rightContent}>
        {count !== undefined && (
          <Text style={styles.count}>{count}</Text>
        )}
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textTertiary}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  lastContainer: {
    borderBottomWidth: 0,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: spacing.md,
  },
  label: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.regular,
    color: colors.textPrimary,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  count: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
});
