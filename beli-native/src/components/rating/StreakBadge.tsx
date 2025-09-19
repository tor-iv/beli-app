import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../typography';
import { theme } from '../../theme';

interface StreakBadgeProps {
  streak: number;
  variant?: 'default' | 'compact';
  style?: ViewStyle;
  testID?: string;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  streak,
  variant = 'default',
  style,
  testID,
}) => {
  const containerStyle = [
    styles.container,
    styles[variant],
    style,
  ];

  return (
    <View style={containerStyle} testID={testID}>
      <Text
        variant={variant === 'compact' ? 'metadata' : 'caption'}
        style={styles.flame}
      >
        🔥
      </Text>
      <Text
        variant={variant === 'compact' ? 'metadata' : 'caption'}
        color="textPrimary"
        style={styles.count}
      >
        {streak}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.borderRadius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    ...theme.shadows.button,
  },

  default: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },

  compact: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 1,
  },

  flame: {
    marginRight: 2,
  },

  count: {
    fontWeight: theme.typography.weights.semibold,
  },
});