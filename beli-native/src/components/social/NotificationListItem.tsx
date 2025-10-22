import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../base';
import { colors, spacing } from '../../theme';
import type { Notification } from '../../types';

interface NotificationListItemProps {
  notification: Notification;
  onPress: () => void;
}

export const NotificationListItem: React.FC<NotificationListItemProps> = ({
  notification,
  onPress,
}) => {
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return '1d';
    return `${diffInDays}d`;
  };

  const renderAvatar = () => {
    if (notification.type === 'streak') {
      // Render flame icon for streak notifications
      return (
        <View style={styles.streakIconContainer}>
          <Ionicons name="flame" size={24} color={colors.textSecondary} />
        </View>
      );
    }

    if (notification.actorUser) {
      return (
        <Avatar
          source={{ uri: notification.actorUser.avatar }}
          size={48}
        />
      );
    }

    return null;
  };

  const renderNotificationText = () => {
    const timestamp = formatTimeAgo(notification.timestamp);

    if (notification.type === 'streak') {
      return (
        <Text style={styles.text}>
          <Text style={styles.boldText}>{notification.streakCount} Week Streak!</Text>
          <Text style={styles.regularText}> {notification.actionDescription}</Text>
          <Text style={styles.timestamp}> {timestamp}</Text>
        </Text>
      );
    }

    if (notification.type === 'comment' && notification.actorUser && notification.targetRestaurant) {
      return (
        <Text style={styles.text}>
          <Text style={styles.semiBoldText}>{notification.actorUser.displayName}</Text>
          <Text style={styles.regularText}> {notification.actionDescription} </Text>
          <Text style={styles.boldText}>{notification.targetRestaurant.name}</Text>
          {notification.commentText && (
            <>
              <Text style={styles.regularText}>: </Text>
              <Text style={styles.regularText}>{notification.commentText}</Text>
            </>
          )}
          <Text style={styles.timestamp}> {timestamp}</Text>
        </Text>
      );
    }

    if (notification.type === 'list_bookmark' && notification.actorUser && notification.targetRestaurant) {
      return (
        <Text style={styles.text}>
          <Text style={styles.semiBoldText}>{notification.actorUser.displayName}</Text>
          <Text style={styles.regularText}> {notification.actionDescription} </Text>
          <Text style={styles.boldText}>{notification.targetRestaurant.name}</Text>
          <Text style={styles.regularText}> from your list</Text>
          <Text style={styles.timestamp}> {timestamp}</Text>
        </Text>
      );
    }

    // Default format for rating_liked, bookmark_liked
    if (notification.actorUser && notification.targetRestaurant) {
      return (
        <Text style={styles.text}>
          <Text style={styles.semiBoldText}>{notification.actorUser.displayName}</Text>
          <Text style={styles.regularText}> {notification.actionDescription} </Text>
          <Text style={styles.boldText}>{notification.targetRestaurant.name}</Text>
          <Text style={styles.timestamp}> {timestamp}</Text>
        </Text>
      );
    }

    return null;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.avatarContainer}>
        {renderAvatar()}
      </View>
      <View style={styles.contentContainer}>
        {renderNotificationText()}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.cardWhite,
    minHeight: 80,
  },
  pressed: {
    backgroundColor: colors.background,
  },
  avatarContainer: {
    marginRight: 12,
    width: 48,
    height: 48,
  },
  streakIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  semiBoldText: {
    fontWeight: '600',
  },
  boldText: {
    fontWeight: '700',
  },
  regularText: {
    fontWeight: '400',
  },
  timestamp: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
  },
});
