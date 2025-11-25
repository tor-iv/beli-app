import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Markdown from 'react-native-markdown-display';
import { colors, typography, spacing, shadows } from '../theme';
import { LoadingSpinner, RestaurantCard } from '../components';
import { useCurrentUser } from '../lib/hooks';
import { MockDataService } from '../data/mockDataService';
import type { TastemakerPost } from '../types';
import type { AppStackParamList } from '../navigation/types';
import { useQuery } from '@tanstack/react-query';

type TastemakerPostScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  'TastemakerPost'
>;

type TastemakerPostScreenRouteProp = RouteProp<AppStackParamList, 'TastemakerPost'>;

export default function TastemakerPostScreen() {
  const navigation = useNavigation<TastemakerPostScreenNavigationProp>();
  const route = useRoute<TastemakerPostScreenRouteProp>();
  const { postId } = route.params;

  // Data fetching with React Query
  const { data: currentUser } = useCurrentUser();
  const { data: post, isLoading } = useQuery({
    queryKey: ['tastemaker-post-full', postId],
    queryFn: () => MockDataService.getTastemakerPostById(postId),
    enabled: !!postId,
    staleTime: 5 * 60 * 1000,
  });

  // Local UI state for interactions (these are optimistic updates)
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize like/bookmark state from post data
  useMemo(() => {
    if (post && currentUser && !hasInitialized) {
      setIsLiked(post.interactions.likes.includes(currentUser.id));
      setIsBookmarked(post.interactions.bookmarks.includes(currentUser.id));
      setHasInitialized(true);
    }
  }, [post, currentUser, hasInitialized]);

  const handleLikeToggle = useCallback(async () => {
    if (!post || !currentUser?.id) return;

    try {
      if (isLiked) {
        await MockDataService.unlikeTastemakerPost(post.id, currentUser.id);
        setIsLiked(false);
      } else {
        await MockDataService.likeTastemakerPost(post.id, currentUser.id);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  }, [post, currentUser, isLiked]);

  const handleBookmarkToggle = useCallback(async () => {
    if (!post || !currentUser?.id) return;

    try {
      if (isBookmarked) {
        await MockDataService.unbookmarkTastemakerPost(post.id, currentUser.id);
        setIsBookmarked(false);
      } else {
        await MockDataService.bookmarkTastemakerPost(post.id, currentUser.id);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  }, [post, currentUser, isBookmarked]);

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

  if (isLoading) {
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

  // Markdown styles matching app design
  const markdownStyles = {
    body: {
      color: colors.textPrimary,
      fontSize: typography.sizes.base,
      lineHeight: 24,
    },
    heading1: {
      fontSize: typography.sizes.xl,
      fontWeight: '700' as const,
      color: colors.textPrimary,
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    heading2: {
      fontSize: typography.sizes.lg,
      fontWeight: '700' as const,
      color: colors.textPrimary,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    paragraph: {
      marginBottom: spacing.md,
      color: colors.textPrimary,
      fontSize: typography.sizes.base,
      lineHeight: 24,
    },
    strong: {
      fontWeight: '700' as const,
      color: colors.textPrimary,
    },
    em: {
      fontStyle: 'italic' as const,
    },
    list_item: {
      marginBottom: spacing.xs,
      color: colors.textPrimary,
      fontSize: typography.sizes.base,
    },
    bullet_list: {
      marginBottom: spacing.md,
    },
    ordered_list: {
      marginBottom: spacing.md,
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: post.coverImage }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          {/* Back Button */}
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </Pressable>
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
          <Markdown style={markdownStyles}>{post.content}</Markdown>
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
              style={styles.restaurantsScrollView}
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
  backButton: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
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
    backgroundColor: colors.background,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  restaurantsScrollView: {
    flexGrow: 0,
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
