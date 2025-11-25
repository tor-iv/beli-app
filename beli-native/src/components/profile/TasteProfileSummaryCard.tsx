import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '../../theme';
import type { Last30DaysStats } from '../../types';

interface TasteProfileSummaryCardProps {
  stats: Last30DaysStats;
  onShare?: () => void;
}

export const TasteProfileSummaryCard: React.FC<TasteProfileSummaryCardProps> = ({
  stats,
  onShare,
}) => {
  const percentile = 100 - stats.activityPercentile;

  return (
    <LinearGradient
      colors={['#4338CA', '#3730A3']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, shadows.card]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.periodLabel}>LAST 30 DAYS</Text>
        {onShare && (
          <TouchableOpacity onPress={onShare} style={styles.shareButton}>
            <Ionicons name="share-outline" size={20} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title}>Top {percentile}% Diner</Text>

      {/* Location */}
      <View style={styles.locationRow}>
        <Ionicons name="location" size={16} color={colors.white} />
        <Text style={styles.locationText}>{stats.primaryLocation}</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.restaurantsCount}</Text>
          <View style={styles.statLabelRow}>
            <Ionicons name="restaurant" size={16} color={colors.white} style={styles.statIcon} />
            <Text style={styles.statLabel}>Restaurants</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.cuisinesCount}</Text>
          <View style={styles.statLabelRow}>
            <Ionicons name="globe-outline" size={16} color={colors.white} style={styles.statIcon} />
            <Text style={styles.statLabel}>Cuisines</Text>
          </View>
        </View>
      </View>

      {/* Activity Comparison */}
      <Text style={styles.activityText}>
        More active than {stats.activityPercentile}% of diners in {stats.primaryLocation}
      </Text>

      {/* Beli Logo */}
      <Text style={styles.logo}>beli</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  periodLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.white,
    letterSpacing: 1,
  },
  shareButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  locationText: {
    fontSize: typography.sizes.base,
    color: colors.white,
    marginLeft: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: spacing['3xl'],
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 4,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.white,
  },
  activityText: {
    fontSize: typography.sizes.sm,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.normal,
    color: colors.white,
    textAlign: 'center',
  },
});
