import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, Caption } from '../typography';
import { theme } from '../../theme';

interface ScoreBadgeProps {
  score: number;
  label: string;
  variant?: 'default' | 'compact';
  style?: ViewStyle;
  testID?: string;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score,
  label,
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
        variant={variant === 'compact' ? 'bodySmall' : 'body'}
        color="textPrimary"
        style={styles.score}
      >
        {score.toFixed(1)}
      </Text>
      <Caption
        variant="metadata"
        color="textSecondary"
        style={styles.label}
      >
        {label}
      </Caption>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    ...theme.shadows.button,
  },

  default: {
    minWidth: 60,
  },

  compact: {
    minWidth: 50,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 4,
  },

  score: {
    fontWeight: theme.typography.weights.semibold,
    lineHeight: 1.1,
  },

  label: {
    marginTop: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});