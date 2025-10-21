import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';
import { Avatar } from '../base/Avatar';

interface ProfileActivityCardProps {
  userAvatar: string;
  userName: string;
  action: string;
  restaurantName: string;
  cuisine?: string;
  location?: string;
  rating?: number;
  visitCount?: number;
  image?: string;
  notes?: string;
  onPress?: () => void;
}

export const ProfileActivityCard: React.FC<ProfileActivityCardProps> = ({
  userAvatar,
  userName,
  action,
  restaurantName,
  cuisine,
  location,
  rating,
  visitCount,
  image,
  notes,
  onPress,
}) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 8) return colors.ratingExcellent;
    if (rating >= 6) return colors.ratingGood;
    if (rating >= 4) return colors.ratingAverage;
    return colors.ratingPoor;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.header}>
        <Avatar source={{ uri: userAvatar }} size="medium" />
        <View style={styles.headerText}>
          <Text style={styles.actionText}>
            <Text style={styles.userName}>{userName}</Text> {action}{' '}
            <Text style={styles.restaurantName}>{restaurantName}</Text>
          </Text>
          {cuisine && location && (
            <Text style={styles.metadata}>
              <Ionicons name="restaurant" size={12} color={colors.textTertiary} /> {cuisine} · {location}
            </Text>
          )}
          {visitCount !== undefined && (
            <Text style={styles.metadata}>
              <Ionicons name="sync" size={12} color={colors.textTertiary} /> {visitCount} visit{visitCount !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        {rating !== undefined && (
          <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(rating) }]}>
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      {image && (
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      )}

      {notes && (
        <Text style={styles.notes}>Notes: {notes}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  actionText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  userName: {
    fontWeight: typography.weights.semibold,
  },
  restaurantName: {
    fontWeight: typography.weights.semibold,
  },
  metadata: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
  ratingBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    borderWidth: 3,
    borderColor: colors.white,
  },
  ratingText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.sm,
  },
  notes: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    lineHeight: 22,
  },
});
