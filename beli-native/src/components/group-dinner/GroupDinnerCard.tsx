import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupDinnerMatch } from '../../types';
import { colors, spacing, typography, shadows } from '../../theme';

interface GroupDinnerCardProps {
  match: GroupDinnerMatch;
  onViewDetails?: () => void;
  savedCount?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - spacing.xl * 2;

export default function GroupDinnerCard({ match, onViewDetails, savedCount = 0 }: GroupDinnerCardProps) {
  const { restaurant, onListsCount, matchReasons, availability } = match;

  return (
    <View style={styles.card}>
      {/* Restaurant Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: restaurant.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Saved Counter Badge */}
        {savedCount > 0 && (
          <View style={[
            styles.savedCounterBadge,
            savedCount >= 3 && { backgroundColor: colors.success }
          ]}>
            <Ionicons name="heart" size={16} color={colors.textInverse} />
            <Text style={styles.savedCounterText}>{savedCount}</Text>
          </View>
        )}

        {availability && (
          <View style={styles.availabilityBadge}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.availabilityText}>
              Available {availability.timeSlot}
            </Text>
          </View>
        )}
      </View>

      {/* Restaurant Info */}
      <View style={styles.content}>
        <Text style={styles.restaurantName} numberOfLines={1}>
          {restaurant.name}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {restaurant.cuisine.join(', ')} • {restaurant.priceRange}
          </Text>
          {restaurant.distance !== undefined && (
            <Text style={styles.metaText}> • {restaurant.distance.toFixed(1)} mi</Text>
          )}
        </View>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <View style={styles.ratingBubble}>
            <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
          </View>
          {restaurant.ratingCount && (
            <Text style={styles.ratingCount}>({restaurant.ratingCount} reviews)</Text>
          )}
        </View>

        {/* Match Info */}
        <View style={styles.matchContainer}>
          <View style={styles.matchHeader}>
            <Ionicons name="people" size={18} color={colors.primary} />
            <Text style={styles.matchTitle}>
              {onListsCount === 1 ? 'Match Info' : `${onListsCount} people want this!`}
            </Text>
          </View>
          <View style={styles.matchReasons}>
            {matchReasons.map((reason, index) => (
              <View key={index} style={styles.reasonRow}>
                <Text style={styles.reasonBullet}>•</Text>
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* More Info Button */}
        {onViewDetails && (
          <TouchableOpacity style={styles.moreInfoButton} onPress={onViewDetails} activeOpacity={0.7}>
            <Text style={styles.moreInfoText}>More Info</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.cardWhite,
    borderRadius: spacing.borderRadius.xl,
    ...shadows.modal,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  savedCounterBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.lg,
    gap: spacing.xs,
    ...shadows.card,
  },
  savedCounterText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    color: colors.textInverse,
  },
  availabilityBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardWhite,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.lg,
    gap: spacing.xs,
    ...shadows.card,
  },
  availabilityText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
    color: colors.success,
  },
  content: {
    padding: spacing.lg,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 29,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metaText: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
    color: colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  ratingBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: '#D9D9DE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ratingExcellent,
  },
  ratingCount: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 17,
    color: colors.textSecondary,
  },
  matchContainer: {
    backgroundColor: 'rgba(11, 123, 127, 0.08)',
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  matchTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    color: colors.primary,
  },
  matchReasons: {
    gap: spacing.xs,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingLeft: spacing.xs,
  },
  reasonBullet: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    color: colors.primary,
    marginRight: spacing.xs,
  },
  reasonText: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
    color: colors.textPrimary,
    flex: 1,
  },
  moreInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  moreInfoText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    color: colors.primary,
  },
});
