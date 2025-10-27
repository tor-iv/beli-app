import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import type { ReservationPriorityLevel } from '../../types';

interface PriorityLevelCardProps {
  priorityLevel: ReservationPriorityLevel;
  onSendInvite?: () => void;
  onShareReservation?: () => void;
  onInfoPress?: () => void;
}

export default function PriorityLevelCard({
  priorityLevel,
  onSendInvite,
  onShareReservation,
  onInfoPress,
}: PriorityLevelCardProps) {
  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'SC':
        return colors.primary;
      case 'Gold':
        return '#FFD700';
      case 'Silver':
        return '#C0C0C0';
      case 'Bronze':
        return '#CD7F32';
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Your Reservation Priority Level: </Text>
          <View style={[styles.levelBadge, { backgroundColor: getLevelColor(priorityLevel.level) }]}>
            <Text style={styles.levelText}>{priorityLevel.level}</Text>
          </View>
        </View>
        {onInfoPress && (
          <Pressable onPress={onInfoPress} hitSlop={8}>
            <Ionicons name="information-circle-outline" size={24} color={colors.textPrimary} />
          </Pressable>
        )}
      </View>

      <Text style={styles.description}>
        Successfully invite a friend or share a reservation to increase your priority!
      </Text>

      <View style={styles.buttonRow}>
        {onSendInvite && (
          <Pressable style={styles.actionButton} onPress={onSendInvite}>
            <Text style={styles.actionButtonText}>Send an invite</Text>
          </Pressable>
        )}
        {onShareReservation && (
          <Pressable style={styles.actionButton} onPress={onShareReservation}>
            <Text style={styles.actionButtonText}>Share a res</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardWhite,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  levelBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: spacing.xs,
  },
  levelText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
