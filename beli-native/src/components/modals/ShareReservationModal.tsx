import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import type { User } from '../../types';
import { MockDataService } from '../../data/mockDataService';

interface ShareReservationModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (selectedFriendIds: string[]) => void;
}

interface FriendItem extends User {
  isSelected: boolean;
}

export const ShareReservationModal: React.FC<ShareReservationModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadFriends();
    }
  }, [visible]);

  const loadFriends = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch the user's friends
      const users = await MockDataService.searchUsers('');
      const friendItems: FriendItem[] = users.map(user => ({
        ...user,
        isSelected: false,
      }));
      setFriends(friendItems);
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFriendSelection = (userId: string) => {
    setFriends(prev =>
      prev.map(friend =>
        friend.id === userId ? { ...friend, isSelected: !friend.isSelected } : friend
      )
    );
  };

  const handleSubmit = () => {
    const selectedIds = friends.filter(f => f.isSelected).map(f => f.id);
    onSubmit(selectedIds);
    // Reset state
    setFriends(prev => prev.map(f => ({ ...f, isSelected: false })));
    setSearchQuery('');
  };

  const handleClose = () => {
    setFriends(prev => prev.map(f => ({ ...f, isSelected: false })));
    setSearchQuery('');
    onClose();
  };

  const filteredFriends = friends.filter(
    friend =>
      friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCount = friends.filter(f => f.isSelected).length;

  const renderFriendItem = ({ item }: { item: FriendItem }) => (
    <Pressable
      style={[styles.friendItem, item.isSelected && styles.friendItemSelected]}
      onPress={() => toggleFriendSelection(item.id)}
    >
      <View style={styles.friendInfo}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{item.displayName[0].toUpperCase()}</Text>
        </View>
        <View style={styles.friendText}>
          <Text style={styles.friendName}>{item.displayName}</Text>
          <Text style={styles.friendUsername}>@{item.username}</Text>
        </View>
      </View>
      <View style={[styles.checkbox, item.isSelected && styles.checkboxSelected]}>
        {item.isSelected && <Ionicons name="checkmark" size={18} color={colors.white} />}
      </View>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.title}>Share Reservation</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search friends..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Selected Count */}
          {selectedCount > 0 && (
            <View style={styles.selectedBanner}>
              <Text style={styles.selectedText}>
                {selectedCount} friend{selectedCount !== 1 ? 's' : ''} selected
              </Text>
            </View>
          )}

          {/* Friends List */}
          <FlatList
            data={filteredFriends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id}
            style={styles.friendsList}
            contentContainerStyle={styles.friendsListContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No friends found' : 'No friends to share with'}
                </Text>
              </View>
            }
          />

          {/* Submit Button */}
          <View style={styles.footer}>
            <Pressable
              style={[styles.submitButton, selectedCount === 0 && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={selectedCount === 0}
            >
              <Text style={styles.submitButtonText}>
                Share with {selectedCount} friend{selectedCount !== 1 ? 's' : ''}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.borderRadius.xl,
    borderTopRightRadius: spacing.borderRadius.xl,
    height: '90%',
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  closeButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  placeholder: {
    width: 44,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardWhite,
    borderRadius: spacing.borderRadius.md,
    margin: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  selectedBanner: {
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: spacing.borderRadius.md,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
  friendsList: {
    flex: 1,
  },
  friendsListContent: {
    paddingHorizontal: spacing.lg,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardWhite,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  friendItemSelected: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  friendText: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderMedium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  emptyState: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  submitButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ShareReservationModal;
