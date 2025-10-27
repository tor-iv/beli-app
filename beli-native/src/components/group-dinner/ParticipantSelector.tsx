import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../base';
import { User } from '../../types';
import { colors, spacing, typography } from '../../theme';
import { MockDataService } from '../../data/mockDataService';

interface ParticipantSelectorProps {
  selectedParticipants: User[];
  onParticipantsChange: (participants: User[]) => void;
  currentUserId: string;
}

export default function ParticipantSelector({
  selectedParticipants,
  onParticipantsChange,
  currentUserId,
}: ParticipantSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<User[]>([]);
  const [recentCompanions, setRecentCompanions] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadFriends();
    loadRecentCompanions();
  }, []);

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
      // Filter out current user and already selected participants
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
    setSearchQuery('');
  };

  const removeParticipant = (userId: string) => {
    onParticipantsChange(selectedParticipants.filter(p => p.id !== userId));
  };

  const renderUserItem = (user: User, showCheckbox: boolean = true) => {
    const selected = isSelected(user.id);

    return (
      <TouchableOpacity
        key={user.id}
        style={styles.userItem}
        onPress={() => toggleParticipant(user)}
        activeOpacity={0.7}
      >
        <Avatar source={{ uri: user.avatar }} size={44} />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: '#000000' }]}>{user.displayName}</Text>
          <Text style={[styles.userHandle, { color: '#8E8E93' }]}>@{user.username}</Text>
        </View>
        {showCheckbox && (
          <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
            {selected && <Ionicons name="checkmark" size={18} color={colors.textInverse} />}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={[styles.question, { color: '#000000' }]}>Who are you eating with?</Text>

      {/* Selected Participants */}
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
              <Text style={[styles.selectedName, { color: '#000000' }]} numberOfLines={1}>
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
          style={styles.searchInput}
          placeholder="Search friends..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
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
              <Text style={[styles.emptyText, { color: '#8E8E93' }]}>Searching...</Text>
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={({ item }) => renderUserItem(item)}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            ) : (
              <Text style={[styles.emptyText, { color: '#8E8E93' }]}>No users found</Text>
            )}
          </>
        ) : (
          // Suggestions
          <>
            {recentCompanions.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: '#8E8E93' }]}>Recent dining companions</Text>
                {recentCompanions
                  .filter(c => !isSelected(c.id))
                  .slice(0, 3)
                  .map(companion => renderUserItem(companion))}
              </View>
            )}

            {friends.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: '#8E8E93' }]}>Friends</Text>
                {friends
                  .filter(f => !isSelected(f.id))
                  .slice(0, 5)
                  .map(friend => renderUserItem(friend))}
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  question: {
    ...typography.textStyles.h3,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  selectedContainer: {
    marginBottom: spacing.md,
    maxHeight: 60,
  },
  selectedContent: {
    gap: spacing.sm,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardWhite,
    borderRadius: spacing.borderRadius.full,
    paddingLeft: spacing.xs,
    paddingRight: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedName: {
    ...typography.textStyles.body,
    fontWeight: '500',
    color: colors.textPrimary,
    maxWidth: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardWhite,
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.textStyles.body,
    color: colors.textPrimary,
    padding: 0,
  },
  resultsContainer: {
    maxHeight: 300,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.textStyles.caption,
    textTransform: 'uppercase',
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.textStyles.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  userHandle: {
    ...typography.textStyles.caption,
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
    ...typography.textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
