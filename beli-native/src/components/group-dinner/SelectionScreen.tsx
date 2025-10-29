import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupDinnerMatch } from '../../types';
import { colors, spacing, typography, shadows } from '../../theme';

interface SelectionScreenProps {
  savedRestaurants: GroupDinnerMatch[];
  onSelectRestaurant: (match: GroupDinnerMatch) => void;
  onStartOver: () => void;
  onViewDetails: (match: GroupDinnerMatch) => void;
  onBack: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - spacing.xl * 2;

export default function SelectionScreen({
  savedRestaurants,
  onSelectRestaurant,
  onStartOver,
  onViewDetails,
  onBack,
}: SelectionScreenProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="checkmark-circle" size={28} color={colors.success} />
          <Text style={styles.headerTitle}>Choose Your Spot!</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.headerSubtitleContainer}>
        <Text style={styles.headerSubtitle}>
          You've saved {savedRestaurants.length} great option{savedRestaurants.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Restaurant Cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {savedRestaurants.map((match, index) => (
          <View key={match.restaurant.id} style={styles.cardContainer}>
            {/* Card Number Badge */}
            <View style={styles.numberBadge}>
              <Text style={styles.numberBadgeText}>Option {index + 1}</Text>
            </View>

            <View style={styles.card}>
              {/* Restaurant Image */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onViewDetails(match)}
              >
                <Image
                  source={{ uri: match.restaurant.images[0] }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </TouchableOpacity>

              {/* Restaurant Info */}
              <View style={styles.content}>
                <Text style={styles.restaurantName} numberOfLines={1}>
                  {match.restaurant.name}
                </Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    {match.restaurant.cuisine.join(', ')} • {match.restaurant.priceRange}
                  </Text>
                  {match.restaurant.distance !== undefined && (
                    <Text style={styles.metaText}> • {match.restaurant.distance.toFixed(1)} mi</Text>
                  )}
                </View>

                {/* Rating */}
                <View style={styles.ratingRow}>
                  <View style={styles.ratingBubble}>
                    <Text style={styles.ratingText}>{match.restaurant.rating.toFixed(1)}</Text>
                  </View>
                  {match.restaurant.ratingCount && (
                    <Text style={styles.ratingCount}>({match.restaurant.ratingCount})</Text>
                  )}
                </View>

                {/* Match Highlights */}
                <View style={styles.highlightsContainer}>
                  {match.matchReasons.slice(0, 2).map((reason, idx) => (
                    <View key={idx} style={styles.highlightRow}>
                      <Ionicons name="checkmark" size={16} color={colors.success} />
                      <Text style={styles.highlightText} numberOfLines={1}>
                        {reason}
                      </Text>
                    </View>
                  ))}
                  {match.availability && (
                    <View style={styles.highlightRow}>
                      <Ionicons name="time" size={16} color={colors.success} />
                      <Text style={styles.highlightText}>
                        Available {match.availability.timeSlot}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Choose Button */}
                <TouchableOpacity
                  style={styles.chooseButton}
                  onPress={() => onSelectRestaurant(match)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.chooseButtonText}>Choose This One</Text>
                  <Ionicons name="arrow-forward" size={20} color={colors.textInverse} />
                </TouchableOpacity>

                {/* View Details Link */}
                <TouchableOpacity
                  style={styles.detailsLink}
                  onPress={() => onViewDetails(match)}
                >
                  <Text style={styles.detailsLinkText}>View full details</Text>
                  <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Start Over Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.startOverButton} onPress={onStartOver}>
          <Ionicons name="refresh" size={20} color={colors.textSecondary} />
          <Text style={styles.startOverText}>Start Over & Keep Swiping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardWhite,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    justifyContent: 'center',
    marginLeft: -24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 29,
    color: colors.textPrimary,
  },
  headerSubtitleContainer: {
    backgroundColor: colors.cardWhite,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  cardContainer: {
    marginBottom: spacing.lg,
  },
  numberBadge: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderTopLeftRadius: spacing.borderRadius.lg,
    borderTopRightRadius: spacing.borderRadius.lg,
    marginLeft: spacing.lg,
  },
  numberBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
    color: colors.textInverse,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.cardWhite,
    borderRadius: spacing.borderRadius.xl,
    ...shadows.card,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: spacing.lg,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
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
    marginBottom: spacing.md,
  },
  ratingBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: '#D9D9DE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ratingExcellent,
  },
  ratingCount: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 17,
    color: colors.textSecondary,
  },
  highlightsContainer: {
    backgroundColor: 'rgba(11, 123, 127, 0.08)',
    borderRadius: spacing.borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  highlightText: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 17,
    color: colors.textPrimary,
    flex: 1,
  },
  chooseButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.lg,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chooseButtonText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
    color: colors.textInverse,
  },
  detailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  detailsLinkText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    color: colors.primary,
  },
  footer: {
    backgroundColor: colors.cardWhite,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  startOverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  startOverText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    color: colors.textSecondary,
  },
});
