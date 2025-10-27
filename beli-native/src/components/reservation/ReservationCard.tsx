import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import type { Reservation } from '../../types';

interface ReservationCardProps {
  reservation: Reservation;
  onClaim?: (reservationId: string) => void;
  onView?: (reservationId: string) => void;
  onCancel?: (reservationId: string) => void;
  showClaimButton?: boolean;
  showViewButton?: boolean;
  showCancelButton?: boolean;
}

export default function ReservationCard({
  reservation,
  onClaim,
  onView,
  onCancel,
  showClaimButton = false,
  showViewButton = false,
  showCancelButton = false,
}: ReservationCardProps) {
  const formatDateTime = (date: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const dayNum = date.getDate();
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;

    const timeStr = `${hours}:${minutesStr} ${ampm}`;

    return `${dayName}, ${monthName} ${dayNum}, ${year}, ${timeStr}`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.mainContent}>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{reservation.restaurant.name}</Text>
          <Text style={styles.dateTime}>{formatDateTime(reservation.dateTime)}</Text>
          <Text style={styles.partySize}>{reservation.partySize} people</Text>
          {reservation.notes && (
            <View style={styles.notesContainer}>
              <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.notes}>{reservation.notes}</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {showClaimButton && onClaim && (
            <Pressable
              style={styles.claimButton}
              onPress={() => onClaim(reservation.id)}
            >
              <Text style={styles.claimButtonText}>Claim</Text>
            </Pressable>
          )}

          {showViewButton && onView && (
            <Pressable
              style={styles.viewButton}
              onPress={() => onView(reservation.id)}
            >
              <Text style={styles.viewButtonText}>View</Text>
            </Pressable>
          )}

          {showCancelButton && onCancel && (
            <Pressable
              style={styles.cancelButton}
              onPress={() => onCancel(reservation.id)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardWhite,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  restaurantInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  dateTime: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  partySize: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  notes: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
  },
  buttonContainer: {
    justifyContent: 'center',
  },
  claimButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  claimButtonText: {
    color: colors.textInverse,
    fontSize: 15,
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  viewButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.error,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '600',
  },
});
