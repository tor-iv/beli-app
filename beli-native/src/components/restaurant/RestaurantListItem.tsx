import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable, Text as RNText } from 'react-native';
import { Text, Caption } from '../typography';
import { RatingBubble, PriceRange } from '../rating';
import { theme } from '../../theme';
import type { Restaurant } from '../../types';

interface RestaurantListItemProps {
  restaurant: Restaurant;
  onPress?: () => void;
  rank?: number;
  showDistance?: boolean;
  showStatus?: boolean;
  isOpen?: boolean;
  closingTime?: string | null;
  style?: ViewStyle;
  testID?: string;
}

export const RestaurantListItem: React.FC<RestaurantListItemProps> = ({
  restaurant,
  onPress,
  rank,
  showDistance = true,
  showStatus = false,
  isOpen,
  closingTime,
  style,
  testID,
}) => {
  const content = (
    <View style={styles.container}>
      {/* Rank Number */}
      {rank !== undefined && (
        <View style={styles.rankContainer}>
          <RNText style={styles.rank}>
            {rank}.
          </RNText>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <RNText style={styles.name}>
          {restaurant.name}
        </RNText>

        <View style={styles.metadata}>
          <PriceRange priceRange={restaurant.priceRange} />
          <RNText style={styles.separator}>
            |
          </RNText>
          <RNText style={styles.cuisine} numberOfLines={1}>
            {restaurant.cuisine.join(', ')}
          </RNText>
        </View>

        <RNText style={styles.address} numberOfLines={1}>
          {restaurant.location.neighborhood}, {restaurant.location.city}, {restaurant.location.state}
        </RNText>

        <View style={styles.statusRow}>
          <RNText style={styles.statusText}>
            {showDistance && restaurant.distance && `${restaurant.distance.toFixed(0)} mi`}
            {showDistance && showStatus && restaurant.distance && " • "}
            {showStatus && (isOpen ? "Open" : "Closed")}
            {showStatus && closingTime && (isOpen
              ? ` • Closes ${closingTime}`
              : ` • Opens ${closingTime}`
            )}
          </RNText>
        </View>
      </View>

      {/* Rating */}
      <View style={styles.ratingContainer}>
        <RatingBubble rating={restaurant.rating} size="medium" />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.pressable,
          pressed && {
            backgroundColor: theme.colors.hoverBackground,
          },
          style,
        ]}
        onPress={onPress}
        testID={testID}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.pressable, style]} testID={testID}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  pressable: {
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.edgePadding,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },

  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  rankContainer: {
    width: 28,
    marginRight: theme.spacing.md,
    marginTop: 2,
  },

  rank: {
    fontSize: 18,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },

  content: {
    flex: 1,
    marginRight: theme.spacing.md,
  },

  name: {
    fontSize: 18,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },

  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  separator: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    marginHorizontal: theme.spacing.xs,
  },

  cuisine: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.normal,
  },

  address: {
    marginBottom: 6,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusSeparator: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.xs,
  },

  statusText: {
    fontSize: 13,
    color: theme.colors.textTertiary,
  },

  ratingContainer: {
    alignItems: 'center',
    marginTop: 2,
  },
});
