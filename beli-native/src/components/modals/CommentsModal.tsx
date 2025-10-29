import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import { Avatar } from '../base';
import type { Activity, ActivityComment, User } from '../../types';

interface CommentsModalProps {
  visible: boolean;
  activity: Activity;
  currentUser?: User;
  onClose: () => void;
  onAddComment?: (content: string) => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  activity,
  currentUser,
  onClose,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState<ActivityComment[]>(
    activity.interactions?.comments || []
  );

  const handleSubmit = () => {
    if (!commentText.trim() || !currentUser) return;

    // Create new comment
    const newComment: ActivityComment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      content: commentText.trim(),
      timestamp: new Date(),
    };

    // Add to local state (optimistic UI)
    setLocalComments([...localComments, newComment]);

    // Call parent handler if provided
    onAddComment?.(commentText.trim());

    // Clear input
    setCommentText('');
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    return `${Math.floor(diffInDays / 7)}w`;
  };

  // Mock user data for displaying comments (in real app, would fetch from service)
  const getUserForComment = (userId: string): User => {
    if (currentUser && userId === currentUser.id) {
      return currentUser;
    }
    // Return activity user as fallback
    return activity.user;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Comments</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.textPrimary} />
            </Pressable>
          </View>

          {/* Comments List */}
          <ScrollView
            style={styles.commentsList}
            contentContainerStyle={styles.commentsContent}
            keyboardShouldPersistTaps="handled"
          >
            {localComments.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="chatbubble-outline"
                  size={48}
                  color={colors.textTertiary}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyText}>No comments yet</Text>
                <Text style={styles.emptySubtext}>Be the first to comment!</Text>
              </View>
            ) : (
              localComments.map((comment) => {
                const commentUser = getUserForComment(comment.userId);
                return (
                  <View key={comment.id} style={styles.commentItem}>
                    <Avatar
                      source={{ uri: commentUser.avatar }}
                      size="small"
                      style={styles.commentAvatar}
                    />
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentUsername}>
                          {commentUser.displayName}
                        </Text>
                        <Text style={styles.commentTime}>
                          {formatTimeAgo(comment.timestamp)}
                        </Text>
                      </View>
                      <Text style={styles.commentText}>{comment.content}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Comment Input */}
          {currentUser && (
            <View style={styles.inputContainer}>
              <Avatar
                source={{ uri: currentUser.avatar }}
                size="small"
                style={styles.inputAvatar}
              />
              <TextInput
                style={styles.input}
                placeholder="Add a comment..."
                placeholderTextColor={colors.textTertiary}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              <Pressable
                onPress={handleSubmit}
                disabled={!commentText.trim()}
                style={[
                  styles.sendButton,
                  !commentText.trim() && styles.sendButtonDisabled,
                ]}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={commentText.trim() ? colors.primary : colors.textTertiary}
                />
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  commentsList: {
    flex: 1,
  },
  commentsContent: {
    padding: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  commentAvatar: {
    marginRight: spacing.sm,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  commentTime: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  commentText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  inputAvatar: {
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  input: {
    flex: 1,
    backgroundColor: colors.cardWhite,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingTop: spacing.sm + 2,
    fontSize: 15,
    color: colors.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sendButton: {
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    marginLeft: spacing.xs,
    marginBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
