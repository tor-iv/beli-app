import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TastemakerPost } from '../../types';
import { colors, spacing, typography, shadows } from '../../theme';

interface TastemakerPostCardProps {
  post: TastemakerPost;
  onPress: () => void;
  variant?: 'default' | 'compact';
}

export default function TastemakerPostCard({
  post,
  onPress,
  variant = 'default',
}: TastemakerPostCardProps) {
  const isCompact = variant === 'compact';

  // Calculate read time (assume 200 words per minute)
  const wordCount = post.content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <Pressable
      style={[styles.card, isCompact && styles.cardCompact]}
      onPress={onPress}
    >
      {/* Cover Image with Gradient Overlay */}
      <View style={[styles.imageContainer, isCompact && styles.imageContainerCompact]}>
        <Image source={{ uri: post.coverImage }} style={styles.coverImage} />
        <View style={styles.gradient} />

        {/* Title and Subtitle on Image */}
        <View style={styles.textOverlay}>
          <Text style={[styles.title, isCompact && styles.titleCompact]} numberOfLines={2}>
            {post.title}
          </Text>
          {!isCompact && post.subtitle && (
            <Text style={styles.subtitle} numberOfLines={2}>
              {post.subtitle}
            </Text>
          )}
        </View>

        {/* Author Info */}
        {post.user && (
          <View style={styles.authorContainer}>
            <Image source={{ uri: post.user.avatar }} style={styles.authorAvatar} />
            <Text style={styles.authorName} numberOfLines={1}>
              @{post.user.username}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Section */}
      <View style={[styles.bottomSection, isCompact && styles.bottomSectionCompact]}>
        {/* Tags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsContainer}
        >
          {post.tags.slice(0, isCompact ? 2 : 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Engagement Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.statText}>
              {post.interactions.views >= 1000
                ? `${(post.interactions.views / 1000).toFixed(1)}k`
                : post.interactions.views}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.statText}>{post.interactions.likes.length}</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.statText}>{readTime} min read</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardCompact: {
    ...shadows.button,
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  imageContainerCompact: {
    height: 160,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  textOverlay: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  titleCompact: {
    fontSize: typography.sizes.base,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.white,
    opacity: 0.9,
  },
  authorContainer: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: spacing.xs,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: spacing.xs,
    backgroundColor: colors.backgroundSecondary,
  },
  authorName: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: '600',
  },
  bottomSection: {
    padding: spacing.md,
    minHeight: 80,
  },
  bottomSectionCompact: {
    padding: spacing.sm,
    minHeight: 70,
  },
  tagsContainer: {
    marginBottom: spacing.sm,
  },
  tag: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: 4,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
    marginRight: spacing.xs,
  },
  tagText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
});
