import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Image,
  Share,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '../../theme';
import type { Restaurant, RankingResult, User } from '../../types';
import { RatingBubble } from '../rating/RatingBubble';

interface RankingResultModalProps {
  visible: boolean;
  restaurant: Restaurant;
  user: User;
  result: RankingResult;
  notes?: string;
  photos?: string[];
  visitCount?: number;
  onClose: () => void;
  onDone: () => void;
}

export const RankingResultModal: React.FC<RankingResultModalProps> = ({
  visible,
  restaurant,
  user,
  result,
  notes,
  photos,
  visitCount = 1,
  onClose,
  onDone,
}) => {
  const handleShare = async (platform: 'copy' | 'instagram_story' | 'instagram_post' | 'tiktok' | 'message') => {
    const shareMessage = `Just rated ${restaurant.name} a ${result.rating} on Beli! 🍽️`;

    try {
      if (platform === 'copy') {
        await Share.share({
          message: shareMessage,
          url: `https://beli.app/restaurant/${restaurant.id}`,
        });
      } else if (platform === 'message') {
        await Share.share({
          message: shareMessage,
          url: `https://beli.app/restaurant/${restaurant.id}`,
        });
      } else {
        // For Instagram and TikTok, you'd use their native sharing APIs
        await Share.share({
          message: shareMessage,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDone = () => {
    onDone();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleDone}
    >
      <View style={styles.container}>
        {/* Solid Beli teal background */}
        <View style={styles.background} />

        {/* Navigation bar */}
        <SafeAreaView style={styles.navBar}>
          <Pressable onPress={handleDone} style={styles.navButton}>
            <Ionicons name="chevron-back" size={28} color={colors.white} />
          </Pressable>
          <Pressable onPress={() => handleShare('copy')} style={styles.navButton}>
            <Ionicons name="share-outline" size={24} color={colors.white} />
          </Pressable>
        </SafeAreaView>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Centered white card with rating */}
          <View style={styles.ratingCard}>
            {/* User header */}
            <View style={styles.userHeader}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.displayName}</Text>
                <Text style={styles.userHandle}>@{user.username}</Text>
              </View>
              <Text style={styles.beliLogo}>beli</Text>
            </View>

            {/* Restaurant name and rating */}
            <View style={styles.restaurantHeader}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <View style={styles.ratingBubbleContainer}>
                <RatingBubble rating={result.rating} size="large" />
              </View>
            </View>

            {/* Location and visit info */}
            <View style={styles.metadataRow}>
              <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.metadataText}>
                {restaurant.priceRange} • {restaurant.location.neighborhood}, {restaurant.location.city}
              </Text>
            </View>

            <View style={styles.metadataRow}>
              <Ionicons name="sync-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.metadataText}>{visitCount} visit{visitCount !== 1 ? 's' : ''}</Text>
            </View>

            {/* Photo if available */}
            {photos && photos.length > 0 && (
              <Image source={{ uri: photos[0] }} style={styles.photo} resizeMode="cover" />
            )}

            {/* Notes */}
            {notes && (
              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText}> {notes}</Text>
              </View>
            )}
          </View>

          {/* Share section with white background card */}
          <View style={styles.shareSection}>
            <View style={styles.shareCard}>
              <Text style={styles.shareTitle}>Share this page</Text>
              <View style={styles.shareButtons}>
                <Pressable
                  style={styles.shareButton}
                  onPress={() => handleShare('copy')}
                >
                  <View style={[styles.shareIconCircle, styles.shareIconGray]}>
                    <Ionicons name="link" size={28} color={colors.white} />
                  </View>
                  <Text style={styles.shareLabel}>Copy Link</Text>
                </Pressable>

                <Pressable
                  style={styles.shareButton}
                  onPress={() => handleShare('instagram_story')}
                >
                  <LinearGradient
                    colors={['#F58529', '#DD2A7B', '#8134AF', '#515BD4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.shareIconCircle}
                  >
                    <Ionicons name="add-circle" size={28} color={colors.white} />
                  </LinearGradient>
                  <Text style={styles.shareLabel}>IG Story</Text>
                </Pressable>

                <Pressable
                  style={styles.shareButton}
                  onPress={() => handleShare('instagram_post')}
                >
                  <LinearGradient
                    colors={['#F58529', '#DD2A7B', '#8134AF', '#515BD4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.shareIconCircle}
                  >
                    <Ionicons name="logo-instagram" size={28} color={colors.white} />
                  </LinearGradient>
                  <Text style={styles.shareLabel}>IG Post</Text>
                </Pressable>

                <Pressable
                  style={styles.shareButton}
                  onPress={() => handleShare('tiktok')}
                >
                  <View style={[styles.shareIconCircle, styles.shareIconTikTok]}>
                    <Ionicons name="musical-notes" size={28} color={colors.white} />
                  </View>
                  <Text style={styles.shareLabel}>TikTok</Text>
                </Pressable>

                <Pressable
                  style={styles.shareButton}
                  onPress={() => handleShare('message')}
                >
                  <View style={[styles.shareIconCircle, styles.shareIconMessage]}>
                    <Ionicons name="chatbubble" size={28} color={colors.white} />
                  </View>
                  <Text style={styles.shareLabel}>Message</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 0 : spacing.md,
    paddingBottom: spacing.sm,
  },
  navButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  ratingCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700' as any,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  userHandle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  beliLogo: {
    fontSize: 26,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    fontStyle: 'italic',
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  restaurantName: {
    flex: 1,
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginRight: spacing.md,
  },
  ratingBubbleContainer: {
    // RatingBubble will handle its own styling
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: spacing.xs,
  },
  metadataText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
  },
  notesSection: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  notesLabel: {
    fontSize: typography.sizes.base,
    fontWeight: '700' as any,
    color: colors.textPrimary,
  },
  notesText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    lineHeight: typography.sizes.base * 1.5,
  },
  shareSection: {
    marginTop: spacing['2xl'],
    width: '100%',
    maxWidth: 500,
  },
  shareCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  shareTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700' as any,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  shareButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  shareButton: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 80,
  },
  shareIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  shareIconGray: {
    backgroundColor: '#8E8E93',
  },
  shareIconTikTok: {
    backgroundColor: '#000000',
  },
  shareIconMessage: {
    backgroundColor: '#00C853',
  },
  shareLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
