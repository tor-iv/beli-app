import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { IconButton } from '../base';
import { Caption } from '../typography';
import { theme } from '../../theme';

interface SocialActionsProps {
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const SocialActions: React.FC<SocialActionsProps> = ({
  likesCount,
  commentsCount,
  isLiked = false,
  isBookmarked = false,
  onLike,
  onComment,
  onBookmark,
  onShare,
  style,
  testID,
}) => {
  // Mock icons - in a real app these would be actual icon components
  const HeartIcon = ({ filled }: { filled: boolean }) => (
    <Caption style={{ fontSize: 18, color: filled ? theme.colors.error : theme.colors.textSecondary }}>
      {filled ? '❤️' : '🤍'}
    </Caption>
  );

  const CommentIcon = () => (
    <Caption style={{ fontSize: 18, color: theme.colors.textSecondary }}>
      💬
    </Caption>
  );

  const BookmarkIcon = ({ filled }: { filled: boolean }) => (
    <Caption style={{ fontSize: 18, color: filled ? theme.colors.primary : theme.colors.textSecondary }}>
      {filled ? '🔖' : '📑'}
    </Caption>
  );

  const ShareIcon = () => (
    <Caption style={{ fontSize: 18, color: theme.colors.textSecondary }}>
      📤
    </Caption>
  );

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.actions}>
        {/* Like Button */}
        <View style={styles.actionItem}>
          <IconButton
            size="small"
            variant="ghost"
            onPress={onLike || (() => {})}
          >
            <HeartIcon filled={isLiked} />
          </IconButton>
          {likesCount > 0 && (
            <Caption variant="metadata" color="textSecondary" style={styles.count}>
              {likesCount}
            </Caption>
          )}
        </View>

        {/* Comment Button */}
        <View style={styles.actionItem}>
          <IconButton
            size="small"
            variant="ghost"
            onPress={onComment || (() => {})}
          >
            <CommentIcon />
          </IconButton>
          {commentsCount > 0 && (
            <Caption variant="metadata" color="textSecondary" style={styles.count}>
              {commentsCount}
            </Caption>
          )}
        </View>

        {/* Share Button */}
        {onShare && (
          <View style={styles.actionItem}>
            <IconButton
              size="small"
              variant="ghost"
              onPress={onShare}
            >
              <ShareIcon />
            </IconButton>
          </View>
        )}
      </View>

      {/* Bookmark Button (Right Aligned) */}
      <IconButton
        size="small"
        variant="ghost"
        onPress={onBookmark || (() => {})}
      >
        <BookmarkIcon filled={isBookmarked} />
      </IconButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },

  count: {
    marginLeft: theme.spacing.xs,
    minWidth: 20,
  },
});