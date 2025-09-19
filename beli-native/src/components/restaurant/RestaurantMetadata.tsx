import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, Caption } from '../typography';
import { PriceRange } from '../rating';
import { theme } from '../../theme';
import type { Restaurant } from '../../types';

interface RestaurantMetadataProps {
  restaurant: Restaurant;
  showDistance?: boolean;
  showHours?: boolean;
  layout?: 'horizontal' | 'vertical';
  style?: ViewStyle;
  testID?: string;
}

export const RestaurantMetadata: React.FC<RestaurantMetadataProps> = ({
  restaurant,
  showDistance = true,
  showHours = false,
  layout = 'horizontal',
  style,
  testID,
}) => {
  const isVertical = layout === 'vertical';

  return (
    <View
      style={[
        styles.container,
        isVertical ? styles.vertical : styles.horizontal,
        style,
      ]}
      testID={testID}
    >
      {/* Price Range and Cuisine */}
      <View style={isVertical ? styles.verticalRow : styles.horizontalRow}>
        <PriceRange priceRange={restaurant.priceRange} />
        <Text variant="caption" color="textSecondary" style={styles.separator}>
          •
        </Text>
        <Caption color="textSecondary" numberOfLines={1} style={styles.flex}>
          {restaurant.cuisine.join(', ')}
        </Caption>
      </View>

      {/* Location */}
      <View style={isVertical ? styles.verticalRow : styles.horizontalRow}>
        <Caption color="textSecondary" numberOfLines={1} style={styles.flex}>
          {restaurant.location.neighborhood}, {restaurant.location.city}
        </Caption>
      </View>

      {/* Distance and Status */}
      {(showDistance || showHours) && (
        <View style={isVertical ? styles.verticalRow : styles.horizontalRow}>
          {showDistance && restaurant.distance && (
            <>
              <Caption color="textSecondary">
                {restaurant.distance.toFixed(1)} mi away
              </Caption>
              {showHours && (
                <Text variant="caption" color="textSecondary" style={styles.separator}>
                  •
                </Text>
              )}
            </>
          )}
          {showHours && (
            <Caption color="success">Open now</Caption>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Base container styles
  },

  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  vertical: {
    flexDirection: 'column',
  },

  horizontalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },

  verticalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },

  separator: {
    marginHorizontal: theme.spacing.xs,
  },

  flex: {
    flex: 1,
  },
});