import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TastemakerBadge as TastemakerBadgeType } from '../../types';
import { spacing, typography } from '../../theme';

interface TastemakerBadgeProps {
  badge: TastemakerBadgeType;
  size?: 'small' | 'medium';
}

export default function TastemakerBadge({ badge, size = 'small' }: TastemakerBadgeProps) {
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: badge.color + '20' }, // Add 20% opacity
        isSmall && styles.badgeSmall,
      ]}
    >
      {badge.icon && (
        <Text style={[styles.icon, isSmall && styles.iconSmall]}>{badge.icon}</Text>
      )}
      <Text
        style={[
          styles.label,
          { color: badge.color },
          isSmall && styles.labelSmall,
        ]}
      >
        {badge.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
  },
  badgeSmall: {
    paddingVertical: 4,
    paddingHorizontal: spacing.xs,
    borderRadius: 12,
  },
  icon: {
    fontSize: 14,
    marginRight: 4,
  },
  iconSmall: {
    fontSize: 12,
    marginRight: 2,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  labelSmall: {
    fontSize: typography.sizes.xs,
  },
});
