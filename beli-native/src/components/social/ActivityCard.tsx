import React from 'react';
import { View, Image, StyleSheet, ViewStyle, Pressable, Text as RNText } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../base';
import { Text, Caption } from '../typography';
import { RatingBubble } from '../rating';
import { theme } from '../../theme';
import type { Activity } from '../../data/mock/activities';

interface ActivityCardProps {
  activity: Activity;
  onPress?: () => void;
  onUserPress?: (userId: string) => void;
  onRestaurantPress?: (restaurantId: string) => void;
  onLike?: () => void;
  onComment?: () => void;
  onBookmark?: () => void;
  currentUserId?: string;
  style?: ViewStyle;
  testID?: string;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onPress,
  onUserPress,
  onRestaurantPress,
  onLike,
  onComment,
  onBookmark,
  currentUserId,
  style,
  testID,
}) => {
  const isLiked = currentUserId && activity.interactions?.likes.includes(currentUserId);
  const isBookmarked = currentUserId && activity.interactions?.bookmarks.includes(currentUserId);

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInMinutes < 60) {
      if (diffInMinutes < 1) return 'Just now';
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    return `${Math.floor(diffInHours / 24)} day${Math.floor(diffInHours / 24) === 1 ? '' : 's'} ago`;
  };

  const getActivityTypeText = (): string => {
    switch (activity.type) {
      case 'visit':
        return 'ranked';
      case 'want_to_try':
        return 'wants to try';
      case 'recommendation':
        return 'recommends';
      default:
        return 'posted about';
    }
  };

  const getRestaurantTypeIcon = (): string => {
    const cuisines = activity.restaurant.cuisine.map(c => c.toLowerCase());

    // Check for specific types
    if (cuisines.includes('bar') || cuisines.includes('cocktail') || cuisines.includes('wine')) {
      return 'wine-outline';
    }
    if (cuisines.includes('bakery') || cuisines.includes('cafe') || cuisines.includes('coffee')) {
      return 'cafe-outline';
    }
    if (cuisines.includes('dessert') || cuisines.includes('ice cream') || cuisines.includes('sweets')) {
      return 'ice-cream-outline';
    }
    if (cuisines.includes('fast food') || cuisines.includes('food truck')) {
      return 'fast-food-outline';
    }

    // Default to restaurant icon
    return 'restaurant-outline';
  };

  const content = (
    <>
      {/* User Header with Activity */}
      <View style={styles.header}>
        <Pressable
          style={styles.userInfo}
          onPress={() => onUserPress?.(activity.user.id)}
        >
          <Avatar
            source={{ uri: activity.user.avatar }}
            size="large"
            style={styles.avatar}
          />
          <View style={styles.userText}>
            <View style={styles.activityTextContainer}>
              <Text style={styles.username}>{activity.user.displayName}</Text>
              <Text style={styles.actionText}> {getActivityTypeText()} </Text>
              <Text style={styles.restaurantNameInline}>{activity.restaurant.name}</Text>
              {activity.companions && activity.companions.length > 0 && (
                <Text style={styles.actionText}> with {activity.companions[0].displayName}</Text>
              )}
            </View>
            {/* Restaurant Details - moved inside userText */}
            <View style={styles.restaurantDetails}>
              <View style={styles.locationInfo}>
                <Ionicons
                  name={getRestaurantTypeIcon() as any}
                  size={12}
                  color={theme.colors.textSecondary}
                  style={styles.restaurantIcon}
                />
                <RNText style={styles.locationText}>
                  • {activity.restaurant.location.neighborhood}, {activity.restaurant.location.city}
                </RNText>
              </View>
              <View style={styles.visitInfo}>
                <Ionicons
                  name="repeat-outline"
                  size={12}
                  color={theme.colors.textSecondary}
                  style={styles.visitIcon}
                />
                <RNText style={styles.visitText}>
                  1 visit
                </RNText>
              </View>
            </View>
          </View>
        </Pressable>
        {activity.rating > 0 && (
          <View style={styles.ratingContainer}>
            <RatingBubble rating={activity.rating} size="small" />
          </View>
        )}
      </View>

      {/* Notes/Comment */}
      {activity.comment && (
        <View style={styles.notesSection}>
          <RNText style={styles.notesLabel}>Notes:</RNText>
          <RNText style={styles.comment}>
            {activity.comment}
          </RNText>
        </View>
      )}

      {/* Images if available */}
      {(activity.images || activity.photos) && (activity.images || activity.photos).length > 0 && (
        <View style={styles.imagesSection}>
          <View style={styles.imagesGrid}>
            {(activity.images || activity.photos).slice(0, 2).map((image: string, index: number) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.activityImage}
                resizeMode="cover"
              />
            ))}
          </View>
        </View>
      )}

      {/* Social Actions */}
      <View style={styles.socialActions}>
        <View style={styles.leftActions}>
          <Pressable style={styles.actionButton} onPress={onLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={18}
              color={isLiked ? theme.colors.error : theme.colors.textSecondary}
            />
          </Pressable>
          <Pressable style={styles.actionButton} onPress={onComment}>
            <Ionicons name="chatbubble-outline" size={18} color={theme.colors.textSecondary} />
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={18} color={theme.colors.textSecondary} />
          </Pressable>
        </View>
        <View style={styles.rightActions}>
          <Pressable style={styles.actionButton}>
            <Ionicons name="add-circle-outline" size={18} color={theme.colors.textSecondary} />
          </Pressable>
          <Pressable style={styles.actionButton} onPress={onBookmark}>
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={18}
              color={isBookmarked ? theme.colors.primary : theme.colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      {/* Timestamp at bottom left */}
      <View style={styles.timestampSection}>
        <Caption color="textSecondary" style={styles.timestamp}>
          {formatTimeAgo(activity.createdAt || activity.timestamp)}
        </Caption>
      </View>
    </>
  );

  return (
    <Pressable style={[styles.container, style]} onPress={onPress} testID={testID}>
      <View style={styles.content}>
        {content}
      </View>
      {/* Bottom separator line */}
      <View style={styles.separator} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
  },

  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 10,
    paddingBottom: 6,
  },

  separator: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginHorizontal: theme.spacing.lg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 2,
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },

  avatar: {
    marginRight: theme.spacing.sm,
  },

  userText: {
    flex: 1,
  },

  activityTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  username: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    fontSize: 16,
    lineHeight: 18,
  },

  actionText: {
    color: theme.colors.textPrimary,
    fontWeight: 'normal',
    fontSize: 16,
    lineHeight: 18,
  },

  restaurantNameInline: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    fontSize: 16,
    lineHeight: 18,
  },

  ratingContainer: {
    marginLeft: theme.spacing.xs,
  },

  restaurantDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
    marginBottom: 2,
    gap: theme.spacing.sm,
  },

  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  restaurantIcon: {
    marginRight: 4,
  },

  locationText: {
    marginLeft: 2,
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.primary,
    lineHeight: 16,
  },

  visitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  visitIcon: {
    marginRight: 4,
  },

  visitText: {
    marginLeft: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.primary,
    lineHeight: 16,
  },

  notesSection: {
    marginTop: 8,
  },

  notesLabel: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
    fontSize: 16,
  },

  comment: {
    lineHeight: 18,
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.primary,
  },

  imagesSection: {
    marginTop: 8,
    marginBottom: 8,
  },

  imagesGrid: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },

  activityImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    flex: 1,
  },

  socialActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },

  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  actionButton: {
    padding: 4,
    paddingHorizontal: 6,
  },

  timestampSection: {
    marginTop: 6,
    marginBottom: 2,
  },

  timestamp: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
});