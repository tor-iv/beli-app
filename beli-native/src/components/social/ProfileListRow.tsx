import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

interface ProfileListRowProps {
  icon: 'checkmark-circle' | 'bookmark' | 'heart';
  label: string;
  count?: number;
  onPress?: () => void;
}

export const ProfileListRow: React.FC<ProfileListRowProps> = ({
  icon,
  label,
  count,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <Ionicons
          name={icon}
          size={28}
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
    fontWeight: typography.weights.regular,
    color: colors.textPrimary,
  },
});
