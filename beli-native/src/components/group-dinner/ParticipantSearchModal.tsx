import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../base';
import { User } from '../../types';
import { colors, spacing, shadows } from '../../theme';
import { MockDataService } from '../../data/mockDataService';

interface ParticipantSearchModalProps {
  visible: boolean;
  selectedParticipants: User[];
  currentUserId: string;
  onClose: () => void;
  onParticipantsChange: (participants: User[]) => void;
}

export default function ParticipantSearchModal({
  visible,
  selectedParticipants,
  currentUserId,
  onClose,
  onParticipantsChange,
}: ParticipantSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<User[]>([]);
  const [recentCompanions, setRecentCompanions] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      loadFriends();
      loadRecentCompanions();
      // Auto-focus search input when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      // Clear search when modal closes
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [visible]);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const loadFriends = async () => {
    try {
      const friendsList = await MockDataService.getUserFriends(currentUserId);
      setFriends(friendsList);
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const loadRecentCompanions = async () => {
    try {
      const companions = await MockDataService.getRecentDiningCompanions(currentUserId);
      setRecentCompanions(companions);
    } catch (error) {
      console.error('Failed to load recent companions:', error);
    }
  };

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const results = await MockDataService.searchUsers(searchQuery);
      const filtered = results.filter(
        user =>
          user.id !== currentUserId &&
          !selectedParticipants.some(p => p.id === user.id)
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const isSelected = (userId: string) => {
    return selectedParticipants.some(p => p.id === userId);
  };

  const toggleParticipant = (user: User) => {
    if (isSelected(user.id)) {
      onParticipantsChange(selectedParticipants.filter(p => p.id !== user.id));
    } else {
      onParticipantsChange([...selectedParticipants, user]);
    }
  };

  const removeParticipant = (userId: string) => {
    onParticipantsChange(selectedParticipants.filter(p => p.id !== userId));
  };

  const renderUserItem = (user: User) => {
    const selected = isSelected(user.id);

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => toggleParticipant(user)}
        activeOpacity={0.7}
      >
        <Avatar source={{ uri: user.avatar }} size={44} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.displayName}</Text>
          <Text style={styles.userHandle}>@{user.username}</Text>
        </View>
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Ionicons name="checkmark" size={18} color={colors.textInverse} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add People</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Selected Participants Chips */}
        {selectedParticipants.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectedContainer}
            contentContainerStyle={styles.selectedContent}
          >
            {selectedParticipants.map(participant => (
              <View key={participant.id} style={styles.selectedChip}>
                <Avatar source={{ uri: participant.avatar }} size={32} />
                <Text style={styles.selectedName} numberOfLines={1}>
                  {participant.displayName}
                </Text>
                <TouchableOpacity
                  onPress={() => removeParticipant(participant.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search friends..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Results */}
        <View style={styles.resultsContainer}>
          {searchQuery.trim() ? (
            // Search Results
            <>
              {isSearching ? (
                <Text style={styles.emptyText}>Searching...</Text>
              ) : searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  renderItem={({ item }) => renderUserItem(item)}
                  keyExtractor={item => item.id}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <Text style={styles.emptyText}>No users found</Text>
              )}
            </>
          ) : (
            // Suggestions
            <ScrollView showsVerticalScrollIndicator={false}>
              {recentCompanions.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>RECENT DINING COMPANIONS</Text>
                  {recentCompanions
                    .filter(c => !isSelected(c.id))
                    .slice(0, 3)
                    .map(companion => (
                      <View key={companion.id}>
                        {renderUserItem(companion)}
                      </View>
                    ))}
                </View>
              )}

              {friends.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>ALL FRIENDS</Text>
                  {friends
                    .filter(f => !isSelected(f.id))
                    .slice(0, 10)
                    .map(friend => (
                      <View key={friend.id}>
                        {renderUserItem(friend)}
                      </View>
                    ))}
                </View>
              )}

              {recentCompanions.length === 0 && friends.length === 0 && (
                <Text style={styles.emptyText}>
                  No friends to add. Search for users above.
                </Text>
              )}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
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
    backgroundColor: colors.cardWhite,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    color: colors.textPrimary,
  },
  selectedContainer: {
    backgroundColor: colors.cardWhite,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    maxHeight: 72,
  },
  selectedContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.full,
    paddingLeft: spacing.xs,
    paddingRight: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  selectedName: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21,
    color: colors.textPrimary,
    maxWidth: 120,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardWhite,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
    color: colors.textPrimary,
    padding: 0,
  },
  resultsContainer: {
    flex: 1,
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 17,
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
  emptyText: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl * 2,
    marginTop: spacing.xl,
  },
});
