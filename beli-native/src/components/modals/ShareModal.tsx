import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Alert,
  Share as RNShare,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { Avatar } from '../base';
import { RatingBubble } from '../rating';
import type { Restaurant, User } from '../../types';

interface ShareModalProps {
  visible: boolean;
  restaurant: Restaurant;
  user?: User;
  onClose: () => void;
}

interface ShareOption {
  id: string;
  label: string;
  icon: any;
  backgroundColor?: string;
  gradientColors?: string[];
  action: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  restaurant,
  user,
  onClose,
}) => {
  const shareUrl = `https://beli.app/restaurant/${restaurant.id}`;
  const shareText = user
    ? `Check out ${restaurant.name} on beli - recommended by ${user.displayName}!`
    : `Check out ${restaurant.name} on beli!`;

  const handleCopyLink = async () => {
    // In a real app, you'd use Clipboard API
    Alert.alert('Link copied!', 'Restaurant link copied to clipboard');
    onClose();
  };

  const handleNativeShare = async () => {
    try {
      await RNShare.share({
        message: shareText,
        url: Platform.OS === 'ios' ? shareUrl : undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleIGStory = () => {
    Alert.alert('Share to Instagram Story', 'This would open Instagram to share as a story');
    onClose();
  };

  const handleIGPost = () => {
    Alert.alert('Share to Instagram Post', 'This would open Instagram to create a post');
    onClose();
  };

  const handleTikTok = () => {
    Alert.alert('Share to TikTok', 'This would open TikTok to create content');
    onClose();
  };

  const handleMessages = () => {
    handleNativeShare();
  };

  const shareOptions: ShareOption[] = [
    {
      id: 'copy',
      label: 'Copy Link',
      icon: 'link',
      backgroundColor: '#8E8E93',
      action: handleCopyLink,
    },
    {
      id: 'ig-story',
      label: 'IG Story',
      icon: 'add-circle',
      gradientColors: ['#833AB4', '#FD1D1D', '#FCAF45'],
      action: handleIGStory,
    },
    {
      id: 'ig-post',
      label: 'IG Post',
      icon: 'logo-instagram',
      gradientColors: ['#F77737', '#E1306C'],
      action: handleIGPost,
    },
    {
      id: 'tiktok',
      label: 'TikTok',
      icon: 'logo-tiktok',
      backgroundColor: '#000000',
      action: handleTikTok,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: 'chatbubble',
      backgroundColor: '#00D856',
      action: handleMessages,
    },
  ];

  // Calculate average rating if restaurant has one
  const restaurantRating = restaurant.scores?.averageScore || restaurant.rating || 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      {/* Full-screen teal overlay */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Restaurant Card - floats in center */}
        <View style={styles.cardContainer}>
          <Pressable style={styles.restaurantCard} onPressIn={(e) => e.stopPropagation()}>
            {user && (
              <View style={styles.userSection}>
                <Avatar source={{ uri: user.avatar }} size="small" />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.displayName}</Text>
                  <Text style={styles.userHandle}>@{user.username}</Text>
                </View>
                <Text style={styles.beliLogo}>beli</Text>
              </View>
            )}

            <View style={styles.restaurantInfo}>
              <View style={styles.restaurantHeader}>
                <View style={styles.restaurantText}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <View style={styles.restaurantMeta}>
                    <Ionicons
                      name="restaurant-outline"
                      size={12}
                      color={colors.textSecondary}
                      style={styles.metaIcon}
                    />
                    <Text style={styles.restaurantDetails}>
                      {restaurant.cuisine.join(', ')} • {restaurant.location.city},{' '}
                      {restaurant.location.state}
                    </Text>
                  </View>
                  {user && (
                    <View style={styles.visitCount}>
                      <Ionicons
                        name="repeat-outline"
                        size={12}
                        color={colors.textSecondary}
                        style={styles.metaIcon}
                      />
                      <Text style={styles.visitText}>1 visit</Text>
                    </View>
                  )}
                </View>
                {restaurantRating > 0 && (
                  <RatingBubble rating={restaurantRating} size="medium" />
                )}
              </View>
            </View>
          </Pressable>
        </View>

        {/* Share Bottom Sheet */}
        <Pressable style={styles.shareSheet} onPressIn={(e) => e.stopPropagation()}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Share Title */}
          <Text style={styles.shareTitle}>Share this page</Text>

          {/* Share Options */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shareOptionsContainer}
          >
            {shareOptions.map((option) => (
              <Pressable
                key={option.id}
                style={styles.shareOption}
                onPress={option.action}
              >
                {option.gradientColors ? (
                  <LinearGradient
                    colors={option.gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.shareIcon}
                  >
                    <Ionicons name={option.icon} size={32} color="#FFFFFF" />
                  </LinearGradient>
                ) : (
                  <View style={[styles.shareIcon, { backgroundColor: option.backgroundColor }]}>
                    <Ionicons name={option.icon} size={32} color="#FFFFFF" />
                  </View>
                )}
                <Text style={styles.shareLabel}>{option.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.primary, // Teal background
    justifyContent: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 100,
    paddingHorizontal: spacing.xl,
    paddingBottom: 20,
  },
  restaurantCard: {
    backgroundColor: colors.cardWhite,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  beliLogo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  restaurantInfo: {
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  restaurantText: {
    flex: 1,
    marginRight: spacing.md,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaIcon: {
    marginRight: 4,
  },
  restaurantDetails: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  visitCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visitText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  shareSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: spacing.xl + 20, // Extra padding for safe area
    paddingTop: spacing.lg,
  },
  dragHandle: {
    width: 50,
    height: 4,
    backgroundColor: colors.borderMedium,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  shareTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
  },
  shareOptionsContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
    justifyContent: 'center',
  },
  shareOption: {
    alignItems: 'center',
    width: 85,
  },
  shareIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  shareLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
