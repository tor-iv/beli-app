import React from 'react';
import { View, Image, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { Card } from '../base';
import { Text, Caption } from '../typography';
import { RatingBubble, PriceRange } from '../rating';
import { theme } from '../../theme';
import type { Restaurant } from '../../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress?: () => void;
  showDistance?: boolean;
  showTags?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onPress,
  showDistance = true,
  showTags = true,
  style,
  testID,
}) => {
  const cuisines = Array.isArray(restaurant.cuisine) ? restaurant.cuisine : [];
  const tags = Array.isArray(restaurant.tags) ? restaurant.tags : [];

  const content = (
    <>
      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: restaurant.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.ratingOverlay}>
          <RatingBubble rating={restaurant.rating} size="medium" />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text variant="h4" numberOfLines={1} style={styles.name}>
          {restaurant.name}
        </Text>

        <View style={styles.metadata}>
          <PriceRange priceRange={restaurant.priceRange} />
          <Text variant="caption" color="textSecondary" style={styles.separator}>
            •
          </Text>
          <Caption color="textSecondary" numberOfLines={1}>
            {cuisines.join(', ')}
          </Caption>
        </View>

        {showDistance && restaurant.distance && (
          <Caption color="textSecondary" style={styles.distance}>
            {restaurant.distance.toFixed(1)} mi away
          </Caption>
        )}

        {showTags && tags.length > 0 && (
          <View style={styles.tags}>
            {tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Caption variant="metadata" color="textSecondary">
                  {tag}
                </Caption>
              </View>
            ))}
          </View>
        )}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.container,
          pressed && {
            transform: [{ scale: theme.animations.scale.press }],
            opacity: theme.animations.opacity.pressed,
          },
          style,
        ]}
        onPress={onPress}
        testID={testID}
      >
        <Card variant="default" padding={0}>
          {content}
        </Card>
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Card variant="default" padding={0}>
        {content}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.cardMargin,
  },

  imageContainer: {
    position: 'relative',
    height: 200,
    borderTopLeftRadius: theme.spacing.borderRadius.md,
    borderTopRightRadius: theme.spacing.borderRadius.md,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  ratingOverlay: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
  },

  content: {
    padding: theme.spacing.cardPadding,
  },

  name: {
    marginBottom: theme.spacing.xs,
  },

  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },

  separator: {
    marginHorizontal: theme.spacing.xs,
  },

  distance: {
    marginBottom: theme.spacing.sm,
  },

  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.xs,
  },

  tag: {
    backgroundColor: theme.colors.borderLight,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.spacing.borderRadius.xs,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
});
