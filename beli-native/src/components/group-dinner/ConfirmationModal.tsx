import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupDinnerMatch, User } from '../../types';
import { colors, spacing, typography, shadows } from '../../theme';
import { Avatar, Button } from '../base';

interface ConfirmationModalProps {
  visible: boolean;
  match: GroupDinnerMatch | null;
  participants: User[];
  onClose: () => void;
  onViewDetails: (restaurantId: string) => void;
  onKeepSwiping: () => void;
}

export default function ConfirmationModal({
  visible,
  match,
  participants,
  onClose,
  onViewDetails,
  onKeepSwiping,
}: ConfirmationModalProps) {
  if (!match) return null;

  const { restaurant, availability } = match;

  const handleShare = async () => {
    try {
      const participantNames = participants.map(p => p.displayName).join(', ');
      const message = participants.length > 0
        ? `Let's go to ${restaurant.name}! ${participantNames}`
        : `Check out ${restaurant.name}!`;

      await Share.share({
        message: `${message}\n\n${restaurant.location.address}\n\n${availability ? `Available at ${availability.timeSlot}` : ''}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleMakeReservation = () => {
    // In a real app, this would deep link to Resy/OpenTable
    // For now, open the website if available
    if (restaurant.website) {
      Linking.openURL(restaurant.website);
    }
  };

  const handleAddToCalendar = () => {
    // In a real app, this would add to device calendar
    console.log('Add to calendar - needs implementation');
  };

  const handleGetDirections = () => {
    const { coordinates } = restaurant.location;
    const url = `https://maps.apple.com/?daddr=${coordinates.lat},${coordinates.lng}`;
    Linking.openURL(url);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dinner Confirmed!</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Restaurant Image */}
          <Image source={{ uri: restaurant.images[0] }} style={styles.image} resizeMode="cover" />

          {/* Restaurant Info */}
          <View style={styles.content}>
            <View style={styles.successBadge}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.successText}>Perfect match!</Text>
            </View>

            <Text style={styles.restaurantName}>{restaurant.name}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                {restaurant.cuisine.join(', ')} • {restaurant.priceRange}
              </Text>
            </View>

            <Text style={styles.address}>{restaurant.location.address}</Text>

            {availability && (
              <View style={styles.availabilityCard}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={styles.availabilityText}>
                  Available {availability.timeSlot}
                </Text>
              </View>
            )}

            {/* Participants */}
            {participants.length > 0 && (
              <View style={styles.participantsSection}>
                <Text style={styles.sectionTitle}>Dining with</Text>
                <View style={styles.participantsList}>
                  {participants.map(participant => (
                    <View key={participant.id} style={styles.participantItem}>
                      <Avatar source={{ uri: participant.avatar }} size={40} />
                      <Text style={styles.participantName}>{participant.displayName}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Next Steps</Text>

              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name="share-social-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionButtonText}>Share with group</Text>
                  <Text style={styles.actionButtonSubtext}>Send to your dining companions</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleMakeReservation}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionButtonText}>Make Reservation</Text>
                  <Text style={styles.actionButtonSubtext}>Book on Resy or OpenTable</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleAddToCalendar}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name="calendar-number-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionButtonText}>Add to Calendar</Text>
                  <Text style={styles.actionButtonSubtext}>Save the date and time</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleGetDirections}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name="navigate-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionButtonText}>Get Directions</Text>
                  <Text style={styles.actionButtonSubtext}>Open in Maps</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onViewDetails(restaurant.id)}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionButtonText}>View Details</Text>
                  <Text style={styles.actionButtonSubtext}>See full restaurant info</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Keep Swiping Button */}
            <TouchableOpacity style={styles.keepSwipingButton} onPress={onKeepSwiping}>
              <Text style={styles.keepSwipingText}>Keep Swiping</Text>
            </TouchableOpacity>

            {/* Done Button */}
            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    color: colors.textPrimary,
  },
  image: {
    width: '100%',
    height: 240,
  },
  content: {
    padding: spacing.lg,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  successText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    color: colors.success,
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metaRow: {
    marginBottom: spacing.xs,
  },
  metaText: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
    color: colors.textPrimary,
  },
  address: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(11, 123, 127, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
    marginBottom: spacing.lg,
  },
  availabilityText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    color: colors.primary,
  },
  participantsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    color: '#000000', // Explicit black for visibility
    marginBottom: spacing.md,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  participantItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  participantName: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 17,
    color: colors.textSecondary,
  },
  actionsSection: {
    marginBottom: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardWhite,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.button,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(11, 123, 127, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    color: '#1A1A1A', // Explicit dark gray for visibility
    marginBottom: 2,
  },
  actionButtonSubtext: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 17,
    color: '#666666', // Explicit medium gray for visibility
  },
  keepSwipingButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  keepSwipingText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    color: colors.primary,
  },
  doneButton: {
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    color: colors.textSecondary,
  },
});
