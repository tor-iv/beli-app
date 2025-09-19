import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { Text, Caption } from '../typography';
import { theme } from '../../theme';
import type { User } from '../../types';

interface UserStatsProps {
  user: User;
  layout?: 'horizontal' | 'vertical';
  showRank?: boolean;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
  onRankPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const UserStats: React.FC<UserStatsProps> = ({
  user,
  layout = 'horizontal',
  showRank = true,
  onFollowersPress,
  onFollowingPress,
  onRankPress,
  style,
  testID,
}) => {
  const StatItem = ({
    value,
    label,
    onPress,
  }: {
    value: number | string;
    label: string;
    onPress?: () => void;
  }) => {
    const content = (
      <View style={styles.statItem}>
        <Text variant="body" style={styles.statValue}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
        <Caption variant="metadata" color="textSecondary" style={styles.statLabel}>
          {label}
        </Caption>
      </View>
    );

    if (onPress) {
      return (
        <Pressable
          style={({ pressed }) => [
            styles.statPressable,
            pressed && { opacity: theme.animations.opacity.pressed },
          ]}
          onPress={onPress}
        >
          {content}
        </Pressable>
      );
    }

    return content;
  };

  const formatRank = (rank: number): string => {
    return `#${rank.toLocaleString()}`;
  };

  return (
    <View
      style={[
        styles.container,
        layout === 'vertical' ? styles.vertical : styles.horizontal,
        style,
      ]}
      testID={testID}
    >
      <StatItem
        value={user.stats.followers}
        label="Followers"
        onPress={onFollowersPress}
      />

      <StatItem
        value={user.stats.following}
        label="Following"
        onPress={onFollowingPress}
      />

      {showRank && (
        <StatItem
          value={formatRank(user.stats.rank)}
          label="Rank on Beli"
          onPress={onRankPress}
        />
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
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  vertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  statPressable: {
    // Pressable wrapper for interactive stats
  },

  statItem: {
    alignItems: 'center',
    minWidth: 60,
  },

  statValue: {
    fontWeight: theme.typography.weights.semibold,
    marginBottom: 1,
  },

  statLabel: {
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});