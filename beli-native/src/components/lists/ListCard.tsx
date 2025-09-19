import React from 'react';
import { View, Image, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { Card } from '../base';
import { Text, Caption } from '../typography';
import { theme } from '../../theme';
import type { List } from '../../types';

interface ListCardProps {
  list: List;
  restaurantImages?: string[]; // Images of restaurants in the list
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const ListCard: React.FC<ListCardProps> = ({
  list,
  restaurantImages = [],
  onPress,
  style,
  testID,
}) => {
  const displayImages = restaurantImages.slice(0, 4);

  const content = (
    <>
      {/* Image Grid */}
      <View style={styles.imageGrid}>
        {displayImages.length > 0 ? (
          displayImages.map((imageUri, index) => (
            <View
              key={index}
              style={[
                styles.imageContainer,
                displayImages.length === 1 && styles.singleImage,
                displayImages.length === 2 && styles.halfImage,
                displayImages.length >= 3 && styles.quarterImage,
              ]}
            >
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          ))
        ) : (
          <View style={styles.placeholderImage}>
            <Text variant="h2" color="textTertiary">
              🍽️
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text variant="h4" numberOfLines={1} style={styles.title}>
          {list.name}
        </Text>

        {list.description && (
          <Caption
            color="textSecondary"
            numberOfLines={2}
            style={styles.description}
          >
            {list.description}
          </Caption>
        )}

        <View style={styles.metadata}>
          <Caption color="textSecondary">
            {list.restaurants.length} {list.restaurants.length === 1 ? 'restaurant' : 'restaurants'}
          </Caption>
          {list.isPublic && (
            <>
              <Text variant="caption" color="textSecondary" style={styles.separator}>
                •
              </Text>
              <Caption color="textSecondary">Public</Caption>
            </>
          )}
        </View>
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
    width: 280, // Fixed width for horizontal scrolling
  },

  imageGrid: {
    height: 120,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopLeftRadius: theme.spacing.borderRadius.md,
    borderTopRightRadius: theme.spacing.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.borderLight,
  },

  imageContainer: {
    overflow: 'hidden',
  },

  singleImage: {
    width: '100%',
    height: '100%',
  },

  halfImage: {
    width: '50%',
    height: '100%',
  },

  quarterImage: {
    width: '50%',
    height: '50%',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.borderLight,
  },

  content: {
    padding: theme.spacing.cardPadding,
  },

  title: {
    marginBottom: theme.spacing.xs,
  },

  description: {
    marginBottom: theme.spacing.sm,
    lineHeight: 16,
  },

  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  separator: {
    marginHorizontal: theme.spacing.xs,
  },
});