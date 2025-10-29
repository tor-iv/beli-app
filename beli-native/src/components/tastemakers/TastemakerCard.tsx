import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../types';
import { colors, spacing, typography, shadows } from '../../theme';
import TastemakerBadge from './TastemakerBadge';

interface TastemakerCardProps {
  tastemaker: User;
  onPress: () => void;
}

export default function TastemakerCard({ tastemaker, onPress }: TastemakerCardProps) {
  const profile = tastemaker.tastemakerProfile;

  if (!profile) return null;

  const displayBadges = profile.badges.slice(0, 3);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* Avatar with verified badge */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: tastemaker.avatar }} style={styles.avatar} />
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark" size={14} color={colors.white} />
        </View>
      </View>

      {/* Username and Specialty */}
      <Text style={styles.username} numberOfLines={1}>
        @{tastemaker.username}
      </Text>
      <Text style={styles.specialty} numberOfLines={1}>
        {profile.specialty}
      </Text>

      {/* Badges */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgesContainer}
      >
        {displayBadges.map((badge, index) => (
          <View key={index} style={styles.badgeWrapper}>
            <TastemakerBadge badge={badge} size="small" />
          </View>
        ))}
      </ScrollView>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {tastemaker.stats.followers >= 1000
              ? `${(tastemaker.stats.followers / 1000).toFixed(1)}k`
              : tastemaker.stats.followers}
          </Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile.totalPosts}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile.engagementRate.toFixed(1)}%</Text>
          <Text style={styles.statLabel}>Engagement</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundSecondary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  username: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  specialty: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  badgesContainer: {
    paddingVertical: spacing.sm,
  },
  badgeWrapper: {
    marginRight: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes.base,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.borderLight,
  },
});
