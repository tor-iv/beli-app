import React from 'react';
import { View, Image, StyleSheet, ViewStyle, Pressable } from 'react-native';
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
  style?: ViewStyle;
  testID?: string;
}

export const RestaurantListItem: React.FC<RestaurantListItemProps> = ({
  restaurant,
  onPress,
  rank,
  showDistance = true,
  showStatus = false,
  style,
  testID,
}) => {
  const content = (
    <View style={styles.container}>
      {/* Rank Number */}
      {rank !== undefined && (
        <View style={styles.rankContainer}>
          <Text variant="h4" color="textSecondary" style={styles.rank}>
            {rank}
          </Text>
        </View>
      )}

      {/* Restaurant Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: restaurant.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text variant="body" numberOfLines={1} style={styles.name}>
          {restaurant.name}
        </Text>

        <View style={styles.metadata}>
          <PriceRange priceRange={restaurant.priceRange} />
          <Text variant="caption" color="textSecondary" style={styles.separator}>
            |
          </Text>
          <Caption color="textSecondary" numberOfLines={1} style={styles.cuisine}>
            {restaurant.cuisine.join(', ')}
          </Caption>
        </View>

        <Caption color="textSecondary" numberOfLines={1} style={styles.address}>
          {restaurant.location.address}, {restaurant.location.neighborhood}
        </Caption>

        {(showDistance || showStatus) && (
          <View style={styles.statusRow}>
            {showDistance && restaurant.distance && (
              <Caption color="textSecondary">
                {restaurant.distance.toFixed(1)} mi
              </Caption>
            )}
            {showDistance && showStatus && (
              <Text variant="caption" color="textSecondary" style={styles.separator}>
                •
              </Text>
            )}
            {showStatus && (
              <Caption color="success">Open now</Caption>
            )}
          </View>
        )}
      </View>

      {/* Rating */}
      <View style={styles.ratingContainer}>
        <RatingBubble rating={restaurant.rating} size="small" />
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
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.edgePadding,
  },

  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rankContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },

  rank: {
    fontWeight: theme.typography.weights.bold,
  },

  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.spacing.borderRadius.sm,
    overflow: 'hidden',
    marginRight: theme.spacing.md,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  content: {
    flex: 1,
    marginRight: theme.spacing.md,
  },

  name: {
    fontWeight: theme.typography.weights.semibold,
    marginBottom: 2,
  },

  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },

  separator: {
    marginHorizontal: theme.spacing.xs,
  },

  cuisine: {
    flex: 1,
  },

  address: {
    marginBottom: 2,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingContainer: {
    alignItems: 'center',
  },
});