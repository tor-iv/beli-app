import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from '../base';
import { MatchPercentage } from '../rating';
import { theme } from '../../theme';
import type { User } from '../../types';

interface UserSearchResultCardProps {
  user: User;
  matchPercentage: number;
  onPress: () => void;
  testID?: string;
}

export const UserSearchResultCard: React.FC<UserSearchResultCardProps> = ({
  user,
  matchPercentage,
  onPress,
  testID,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={theme.animations.opacity.pressed}
      testID={testID}
    >
      <Avatar
        source={{ uri: user.avatar }}
        size="medium"
        initials={user.displayName.substring(0, 2).toUpperCase()}
      />

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.displayName} numberOfLines={1}>
            {user.displayName}
          </Text>
          <MatchPercentage percentage={matchPercentage} variant="compact" />
        </View>
        <Text style={styles.username} numberOfLines={1}>
          @{user.username}
        </Text>
        <Text style={styles.stats}>
          {user.stats.followers} Followers " {user.stats.beenCount} Been
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderLight,
  },
  content: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: 2,
  },
  displayName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  username: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  stats: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textTertiary,
  },
});
