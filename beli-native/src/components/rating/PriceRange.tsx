import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../typography';
import { theme } from '../../theme';

interface PriceRangeProps {
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  style?: ViewStyle;
  testID?: string;
}

export const PriceRange: React.FC<PriceRangeProps> = ({
  priceRange,
  style,
  testID,
}) => {
  const activeDollars = priceRange.length;
  const totalDollars = 4;

  return (
    <View style={[styles.container, style]} testID={testID}>
      {Array.from({ length: totalDollars }, (_, index) => (
        <Text
          key={index}
          variant="bodySmall"
          color={index < activeDollars ? 'textPrimary' : 'textTertiary'}
          style={styles.dollar}
        >
          $
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dollar: {
    fontWeight: theme.typography.weights.semibold,
    marginRight: 1,
  },
});