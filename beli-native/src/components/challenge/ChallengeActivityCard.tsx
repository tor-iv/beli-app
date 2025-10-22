import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { Avatar } from '../base';
import { RatingBubble } from '../rating';

interface ChallengeActivityCardProps {
  userAvatar: string;
  restaurantName: string;
  cuisine: string;
  location: string;
  rating: number;
  notes?: string;
  date: string;
  onPress?: () => void;
}

export default function ChallengeActivityCard({
  userAvatar,
  restaurantName,
  cuisine,
  location,
  rating,
  notes,
  date,
  onPress,
}: ChallengeActivityCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Avatar source={{ uri: userAvatar }} size="medium" />
        <View style={styles.headerText}>
          <Text style={styles.actionText}>
            You ranked <Text style={styles.restaurantName}>{restaurantName}</Text>
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="restaurant-outline" size={14} color={colors.textTertiary} />
            <Text style={styles.locationText}>
              {cuisine} · {location}
            </Text>
          </View>
        </View>
        <RatingBubble rating={rating} size="large" />
      </View>

      {notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesText}>
            <Text style={styles.notesLabel}>Notes: </Text>
            {notes}
          </Text>
        </View>
      )}

      <Text style={styles.date}>{date}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  actionText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  restaurantName: {
    fontWeight: typography.weights.semibold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
  },
  notesContainer: {
    marginTop: spacing.md,
    marginLeft: 52, // Align with text above (avatar + gap)
  },
  notesLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  notesText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  date: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    marginTop: spacing.md,
    marginLeft: 52,
  },
});
