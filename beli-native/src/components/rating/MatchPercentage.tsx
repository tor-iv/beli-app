import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../typography';
import { theme } from '../../theme';

interface MatchPercentageProps {
  percentage: number;
  variant?: 'default' | 'compact';
  style?: ViewStyle;
  testID?: string;
}

export const MatchPercentage: React.FC<MatchPercentageProps> = ({
  percentage,
  variant = 'default',
  style,
  testID,
}) => {
  const containerStyle = [
    styles.container,
    styles[variant],
    style,
  ];

  const displayText = variant === 'compact'
    ? `${percentage}%`
    : `+${percentage}% Match`;

  return (
    <View style={containerStyle} testID={testID}>
      <Text
        variant={variant === 'compact' ? 'caption' : 'bodySmall'}
        color="success"
        style={styles.text}
      >
        {displayText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 166, 118, 0.1)', // Success color with transparency
    borderRadius: theme.spacing.borderRadius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  default: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },

  compact: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 1,
  },

  text: {
    fontWeight: theme.typography.weights.semibold,
  },
});