import React from 'react';
import { View, StyleSheet, ViewStyle, Text } from 'react-native';
import { theme } from '../../theme';

interface PriceRangeProps {
  priceRange: '$' | '$$' | '$$$' | '$$$$' | '€€€' | string;
  style?: ViewStyle;
  testID?: string;
}

export const PriceRange: React.FC<PriceRangeProps> = ({
  priceRange,
  style,
  testID,
}) => {
  const activeSymbols = priceRange.length;
  const totalSymbols = 4;
  const symbol = priceRange.includes('€') ? '€' : '$';

  return (
    <View style={[styles.container, style]} testID={testID}>
      {Array.from({ length: totalSymbols }, (_, index) => (
        <Text
          key={index}
          style={[
            styles.symbol,
            {
              color: index < activeSymbols
                ? theme.colors.textPrimary
                : theme.colors.textTertiary,
            },
          ]}
        >
          {symbol}
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

  symbol: {
    fontSize: 14,
    fontWeight: theme.typography.weights.semibold,
    marginRight: 1,
  },
});