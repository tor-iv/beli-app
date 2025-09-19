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
      case 'bookmark':
        return 'bookmarked';
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
            size="medium"
            style={styles.avatar}
          />
          <View style={styles.userText}>
            <View style={styles.activityTextContainer}>
              <Text style={styles.username}>{activity.user.displayName}</Text>
              <Text style={styles.actionText}> {getActivityTypeText()} </Text>
              <Text style={styles.restaurantNameInline}>{activity.restaurant.name}</Text>
              {activity.type === 'bookmark' && (
                <Text style={styles.actionText}> and 1 other</Text>
              )}
              {activity.companions && activity.companions.length > 0 && (
                <Text style={styles.actionText}> with {activity.companions[0].displayName}</Text>
              )}
            </View>
            {/* Restaurant Details - moved inside userText */}
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
            {/* Visit count on separate line */}
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
        </Pressable>
        {activity.rating > 0 && activity.type !== 'bookmark' && (
          <View style={styles.ratingContainer}>
            <RatingBubble rating={activity.rating} size="small" />
          </View>
        )}
      </View>

      {/* Notes/Comment */}
      {activity.comment && activity.comment.trim() && (
        <View style={styles.notesSection}>
          <RNText style={styles.comment}>
            <RNText style={styles.notesLabel}>Notes: </RNText>
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
              size={20}
              color={isLiked ? theme.colors.error : theme.colors.textSecondary}
            />
          </Pressable>
          <Pressable style={styles.actionButton} onPress={onComment}>
            <Ionicons name="chatbubble-outline" size={20} color={theme.colors.textSecondary} />
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={20} color={theme.colors.textSecondary} />
          </Pressable>
        </View>
        <View style={styles.rightActions}>
          <Pressable style={styles.actionButton}>
            <Ionicons name="add-circle-outline" size={20} color={theme.colors.textSecondary} />
          </Pressable>
          <Pressable style={styles.actionButton} onPress={onBookmark}>
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={20}
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
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 14,
    paddingBottom: 12,
  },

  separator: {
    height: 0.5,
    backgroundColor: theme.colors.borderLight,
    opacity: 0.5,
    marginHorizontal: theme.spacing.lg,
    marginBottom: 8,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
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
    fontWeight: '600',
    color: theme.colors.textPrimary,
    fontSize: 15,
    lineHeight: 18,
  },

  actionText: {
    color: theme.colors.textPrimary,
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 18,
  },

  restaurantNameInline: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
    fontSize: 15,
    lineHeight: 18,
  },

  ratingContainer: {
    marginLeft: theme.spacing.xs,
  },

  restaurantDetails: {
    flexDirection: 'column',
    marginTop: 1,
    marginBottom: 2,
    gap: 2,
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
    fontWeight: '400',
  },

  visitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
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
    fontWeight: '400',
  },

  notesSection: {
    marginTop: 6,
    marginBottom: 2,
  },

  notesLabel: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
    fontSize: 15,
  },

  comment: {
    lineHeight: 18,
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: '400',
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
    marginTop: 12,
  },

  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  actionButton: {
    padding: 4,
    paddingHorizontal: 6,
  },

  timestampSection: {
    marginTop: 8,
    marginBottom: 2,
  },

  timestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
});