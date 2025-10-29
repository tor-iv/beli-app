import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { colors, typography, spacing, shadows } from '../theme';
import { LoadingSpinner, RestaurantCard } from '../components';
import { MockDataService } from '../data/mockDataService';
import type { TastemakerPost } from '../types';
import type { AppStackParamList } from '../navigation/types';

type TastemakerPostScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  'TastemakerPost'
>;

type TastemakerPostScreenRouteProp = RouteProp<AppStackParamList, 'TastemakerPost'>;

export default function TastemakerPostScreen() {
  const navigation = useNavigation<TastemakerPostScreenNavigationProp>();
  const route = useRoute<TastemakerPostScreenRouteProp>();
  const { postId } = route.params;

  const [post, setPost] = useState<TastemakerPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    loadPostData();
  }, [postId]);

  const loadPostData = async () => {
    try {
      setLoading(true);
      const postData = await MockDataService.getTastemakerPostById(postId);
      const user = await MockDataService.getCurrentUser();

      if (postData) {
        setPost(postData);
        setCurrentUserId(user.id);
        setIsLiked(postData.interactions.likes.includes(user.id));
        setIsBookmarked(postData.interactions.bookmarks.includes(user.id));
      }
    } catch (error) {
      console.error('Failed to load post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!post || !currentUserId) return;

    try {
      if (isLiked) {
        await MockDataService.unlikeTastemakerPost(post.id, currentUserId);
        setIsLiked(false);
      } else {
        await MockDataService.likeTastemakerPost(post.id, currentUserId);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!post || !currentUserId) return;

    try {
      if (isBookmarked) {
        await MockDataService.unbookmarkTastemakerPost(post.id, currentUserId);
        setIsBookmarked(false);
      } else {
        await MockDataService.bookmarkTastemakerPost(post.id, currentUserId);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleShare = () => {
    console.log('Share post:', postId);
  };

  const handleAuthorPress = () => {
    if (post?.user) {
      navigation.navigate('UserProfile', { userId: post.user.id });
    }
  };

  const handleRestaurantPress = (restaurantId: string) => {
    navigation.navigate('RestaurantInfo', { restaurantId });
  };

  // Calculate read time
  const calculateReadTime = (content: string): number => {
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Article not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const readTime = calculateReadTime(post.content);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: post.coverImage }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.title}>{post.title}</Text>
            {post.subtitle && <Text style={styles.subtitle}>{post.subtitle}</Text>}
          </View>
        </View>

        {/* Author Card */}
        {post.user && (
          <Pressable style={styles.authorCard} onPress={handleAuthorPress}>
            <Image source={{ uri: post.user.avatar }} style={styles.authorAvatar} />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>@{post.user.username}</Text>
              <Text style={styles.authorSpecialty}>
                {post.user.tastemakerProfile?.specialty}
              </Text>
            </View>
          </Pressable>
        )}

        {/* Engagement Bar */}
        <View style={styles.engagementBar}>
          <View style={styles.engagementStats}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>
                {post.interactions.views >= 1000
                  ? `${(post.interactions.views / 1000).toFixed(1)}k`
                  : post.interactions.views}{' '}
                views
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{post.interactions.likes.length} likes</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{readTime} min read</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.contentText}>{post.content}</Text>
        </View>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {post.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>

        {/* Featured Restaurants */}
        {post.restaurants && post.restaurants.length > 0 && (
          <View style={styles.restaurantsSection}>
            <Text style={styles.sectionTitle}>Featured Restaurants</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.restaurantsList}
            >
              {post.restaurants.map((restaurant) => (
                <View key={restaurant.id} style={styles.restaurantCard}>
                  <RestaurantCard
                    restaurant={restaurant}
                    onPress={() => handleRestaurantPress(restaurant.id)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <Pressable style={styles.actionButton} onPress={handleLikeToggle}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={isLiked ? colors.error : colors.textPrimary}
          />
          <Text style={styles.actionButtonText}>Like</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={handleBookmarkToggle}>
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isBookmarked ? colors.primary : colors.textPrimary}
          />
          <Text style={styles.actionButtonText}>Save</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={colors.textPrimary} />
          <Text style={styles.actionButtonText}>Share</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
  },
  heroContainer: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  heroContent: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.white,
    opacity: 0.9,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
    marginRight: spacing.md,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  authorSpecialty: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  engagementBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  engagementStats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.lg,
  },
  contentText: {
    fontSize: typography.sizes.base,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
  },
  tagText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  restaurantsSection: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  restaurantsList: {
    paddingHorizontal: spacing.lg,
  },
  restaurantCard: {
    width: 280,
    marginRight: spacing.md,
  },
  actionBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
    ...shadows.card,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  actionButtonText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
