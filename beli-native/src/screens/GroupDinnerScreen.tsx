import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, typography } from '../theme';
import {
  ParticipantSearchModal,
  RestaurantSwiper,
  ConfirmationModal,
  SelectionScreen,
} from '../components/group-dinner';
import { MockDataService } from '../data/mockDataService';
import type { User, GroupDinnerMatch } from '../types';
import type { AppStackParamList } from '../navigation/types';

type GroupDinnerScreenNavigationProp = StackNavigationProp<AppStackParamList>;

export default function GroupDinnerScreen() {
  const navigation = useNavigation<GroupDinnerScreenNavigationProp>();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<User[]>([]);
  const [matches, setMatches] = useState<GroupDinnerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [savedRestaurants, setSavedRestaurants] = useState<GroupDinnerMatch[]>([]);
  const [showSelectionScreen, setShowSelectionScreen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<GroupDinnerMatch | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [shuffleCount, setShuffleCount] = useState(0);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadMatches();
    }
  }, [currentUser, selectedParticipants, shuffleCount]);

  const loadUser = async () => {
    try {
      const user = await MockDataService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const loadMatches = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const participantIds = selectedParticipants.map(p => p.id);
      const suggestions = await MockDataService.getGroupDinnerSuggestions(
        currentUser.id,
        participantIds.length > 0 ? participantIds : undefined
      );
      setMatches(suggestions);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeLeft = (match: GroupDinnerMatch) => {
    console.log('Passed on:', match.restaurant.name);
  };

  const handleSwipeRight = (match: GroupDinnerMatch) => {
    console.log('[GroupDinnerScreen] handleSwipeRight called:', match.restaurant.name);
    console.log('[GroupDinnerScreen] Current savedRestaurants.length:', savedRestaurants.length);
    console.log('[GroupDinnerScreen] Already saved?', savedRestaurants.find(r => r.restaurant.id === match.restaurant.id) ? 'YES' : 'NO');

    // Add to saved list if not already saved and under limit
    if (savedRestaurants.length < 3 && !savedRestaurants.find(r => r.restaurant.id === match.restaurant.id)) {
      const newSaved = [...savedRestaurants, match];
      console.log('[GroupDinnerScreen] Adding restaurant. New count:', newSaved.length);
      setSavedRestaurants(newSaved);

      // If we now have 3, show selection screen
      if (newSaved.length === 3) {
        console.log('[GroupDinnerScreen] Reached 3 saved, showing selection screen');
        setShowSelectionScreen(true);
      }
    } else {
      console.log('[GroupDinnerScreen] NOT adding - either at limit or already saved');
    }
  };

  const handleShuffle = () => {
    setShuffleCount(count => count + 1);
  };

  const handleCardPress = (match: GroupDinnerMatch) => {
    navigation.navigate('RestaurantInfo', { restaurantId: match.restaurant.id });
  };

  const handleSelectRestaurant = (match: GroupDinnerMatch) => {
    setSelectedMatch(match);
    setShowSelectionScreen(false);
    setShowConfirmationModal(true);
  };

  const handleStartOver = () => {
    setSavedRestaurants([]);
    setShowSelectionScreen(false);
  };

  const handleBackFromSelection = () => {
    setShowSelectionScreen(false);
    // Keep saved restaurants so user can continue swiping and save more
  };

  const handleViewDetailsFromSelection = (match: GroupDinnerMatch) => {
    navigation.navigate('RestaurantInfo', { restaurantId: match.restaurant.id });
  };

  const handleViewDetails = (restaurantId: string) => {
    setShowConfirmationModal(false);
    navigation.navigate('RestaurantInfo', { restaurantId });
  };

  const handleKeepSwiping = () => {
    setShowConfirmationModal(false);
    setSelectedMatch(null);
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Show selection screen when user has saved 3 restaurants
  if (showSelectionScreen) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <SelectionScreen
          savedRestaurants={savedRestaurants}
          onSelectRestaurant={handleSelectRestaurant}
          onStartOver={handleStartOver}
          onViewDetails={handleViewDetailsFromSelection}
          onBack={handleBackFromSelection}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eat Now</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Participant Search Button */}
      <TouchableOpacity
        style={styles.participantToggle}
        onPress={() => setShowSearchModal(true)}
        activeOpacity={0.7}
      >
        <View style={styles.participantToggleLeft}>
          {selectedParticipants.length > 0 ? (
            <>
              <Ionicons name="people" size={20} color={colors.primary} />
              <Text style={styles.participantToggleText}>
                {selectedParticipants.length === 1
                  ? `${selectedParticipants[0].displayName}`
                  : `${selectedParticipants.length} people selected`}
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.participantTogglePlaceholder}>
                Add people you're eating with
              </Text>
            </>
          )}
        </View>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Restaurant Swiper */}
      <View style={styles.swiperContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Finding perfect matches...</Text>
          </View>
        ) : matches.length > 0 ? (
          <RestaurantSwiper
            matches={matches}
            savedRestaurants={savedRestaurants}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onShuffle={handleShuffle}
            onCardPress={handleCardPress}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No restaurants found</Text>
            <Text style={styles.emptyText}>
              {selectedParticipants.length > 0
                ? "You and your group don't have any matching restaurants on your want-to-try lists."
                : "Add some restaurants to your want-to-try list to get started!"}
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('Tabs')}
            >
              <Text style={styles.addButtonText}>Go to Lists</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Participant Search Modal */}
      <ParticipantSearchModal
        visible={showSearchModal}
        selectedParticipants={selectedParticipants}
        currentUserId={currentUser.id}
        onClose={() => setShowSearchModal(false)}
        onParticipantsChange={setSelectedParticipants}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmationModal}
        match={selectedMatch}
        participants={selectedParticipants}
        onClose={() => setShowConfirmationModal(false)}
        onViewDetails={handleViewDetails}
        onKeepSwiping={handleKeepSwiping}
      />
    </SafeAreaView>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    color: colors.textPrimary,
  },
  participantToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.cardWhite,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  participantToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  participantToggleText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21,
    color: colors.primary,
    flex: 1,
  },
  participantToggleTextGray: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
    color: colors.textSecondary,
    flex: 1,
  },
  participantTogglePlaceholder: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21,
    color: colors.primary,
    flex: 1,
  },
  swiperContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 29,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.lg,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    color: colors.textInverse,
  },
});
