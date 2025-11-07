'use client';

import { Users, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { CategorySelectionModal } from '@/components/group-dinner/category-selection-modal';
import { ConfirmationModal } from '@/components/group-dinner/confirmation-modal';
import { ParticipantSelector } from '@/components/group-dinner/participant-selector';
import { RestaurantSwiper } from '@/components/group-dinner/restaurant-swiper';
import { SelectionScreen } from '@/components/group-dinner/selection-screen';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useGroupDinnerReducer } from '@/lib/hooks/use-group-dinner-reducer';
import { GroupDinnerService, UserService } from '@/lib/services';

import type { User, GroupDinnerMatch, ListCategory } from '@/types';

export default function GroupDinnerPage() {
  const router = useRouter();

  // Use reducer for state machine
  const [state, dispatch] = useGroupDinnerReducer();
  const {
    phase,
    user: currentUser,
    participants: selectedParticipants,
    category: selectedCategory,
    matches,
    currentIndex,
    savedMatches: savedRestaurants,
    selectedMatch,
    showParticipantSelector,
    error,
  } = state;

  // Derived state for modal visibility
  const showCategoryModal = phase === 'category-selection';
  const showSelectionScreen = phase === 'selection';
  const showConfirmationModal = phase === 'confirmation';
  const loading = phase === 'loading';

  // Load initial data
  React.useEffect(() => {
    const init = async () => {
      try {
        const user = await UserService.getCurrentUser();
        dispatch({ type: 'INIT_SUCCESS', user });
        // Don't load matches yet - wait for category selection
      } catch (error) {
        console.error('Failed to initialize:', error);
        dispatch({ type: 'INIT_ERROR', error: 'Failed to load user' });
      }
    };
    init();
  }, []);

  // Load matches when category is selected or participants change
  React.useEffect(() => {
    if (currentUser && !showCategoryModal && phase === 'loading') {
      const participantIds = selectedParticipants.map((p) => p.id);
      loadMatches(currentUser.id, participantIds, selectedCategory);
    }
  }, [currentUser, selectedParticipants, selectedCategory, showCategoryModal, phase]);

  // Load suggestions based on participants
  const loadMatches = async (userId: string, participantIds: string[], category?: ListCategory) => {
    try {
      const suggestions = await GroupDinnerService.getGroupDinnerSuggestions(
        userId,
        participantIds.length > 0 ? participantIds : undefined,
        category
      );
      dispatch({ type: 'LOAD_MATCHES', matches: suggestions });
    } catch (error) {
      console.error('Failed to load matches:', error);
      dispatch({ type: 'INIT_ERROR', error: 'Failed to load matches' });
    }
  };

  // Handle swipe right (save)
  const handleSwipeRight = (match: GroupDinnerMatch) => {
    dispatch({ type: 'SWIPE_RIGHT', match });
  };

  // Handle swipe left (pass)
  const handleSwipeLeft = (match: GroupDinnerMatch) => {
    dispatch({ type: 'SWIPE_LEFT' });
  };

  // Handle restaurant selection from selection screen
  const handleSelectRestaurant = (match: GroupDinnerMatch) => {
    dispatch({ type: 'SELECT_MATCH', match });
  };

  // Handle shuffle
  const handleShuffle = async () => {
    if (!currentUser) return;
    const participantIds = selectedParticipants.map((p) => p.id);
    try {
      const suggestions = await GroupDinnerService.getGroupDinnerSuggestions(
        currentUser.id,
        participantIds.length > 0 ? participantIds : undefined,
        selectedCategory
      );
      dispatch({ type: 'SHUFFLE', matches: suggestions });
    } catch (error) {
      console.error('Failed to shuffle:', error);
    }
  };

  // Handle start over
  const handleStartOver = () => {
    dispatch({ type: 'START_OVER' });
  };

  // Handle participant confirmation
  const handleParticipantsConfirm = async (participants: User[]) => {
    dispatch({ type: 'UPDATE_PARTICIPANTS', participants });
    // Trigger matches reload via useEffect
  };

  // Handle keep swiping from confirmation
  const handleKeepSwiping = () => {
    dispatch({ type: 'KEEP_SWIPING' });
  };

  // Handle category selection
  const handleSelectCategory = (category: ListCategory) => {
    dispatch({ type: 'SELECT_CATEGORY', category });
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Mobile Header */}
      <div className="flex-shrink-0 border-b bg-white px-4 py-3 md:hidden">
        <h1 className="text-2xl font-bold">Group Dinner</h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden flex-shrink-0 border-b bg-white px-6 py-4 md:block">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold">Group Dinner</h1>
          <p className="mt-1 text-muted">
            Find the perfect restaurant for your group • Use{' '}
            <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-800">
              ←
            </kbd>{' '}
            <kbd className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-800">
              →
            </kbd>{' '}
            to swipe
          </p>
        </div>
      </div>

      {/* Participant Section */}
      <div className="flex-shrink-0 border-b bg-white p-4">
        <button
          onClick={() => dispatch({ type: 'OPEN_PARTICIPANT_SELECTOR' })}
          className="mx-auto w-full max-w-2xl"
        >
          {selectedParticipants.length > 0 ? (
            /* Selected Participants Display */
            <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3 transition-colors hover:bg-primary/10">
              <Users className="h-5 w-5 flex-shrink-0 text-primary" />
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-primary">
                  Dining with {selectedParticipants.length}{' '}
                  {selectedParticipants.length === 1 ? 'person' : 'people'}
                </p>
                <p className="text-xs text-muted">
                  {selectedParticipants.map((p) => p.displayName).join(', ')}
                </p>
              </div>
              <div className="flex -space-x-2">
                {selectedParticipants.slice(0, 3).map((user) => (
                  <Avatar key={user.id} className="h-8 w-8 border-2 border-white">
                    <AvatarImage src={user.avatar} alt={user.displayName} />
                    <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                  </Avatar>
                ))}
                {selectedParticipants.length > 3 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200">
                    <span className="text-xs font-semibold text-gray-800">
                      +{selectedParticipants.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty State - Add Participants */
            <div className="flex items-center justify-center gap-2 rounded-lg py-3 font-medium text-primary transition-colors hover:bg-primary/5">
              <Plus className="h-5 w-5" />
              <span>Add people you're eating with</span>
            </div>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="text-muted">Finding perfect matches...</p>
            </div>
          </div>
        ) : showSelectionScreen ? (
          <SelectionScreen
            savedRestaurants={savedRestaurants}
            onSelectRestaurant={handleSelectRestaurant}
            onStartOver={handleStartOver}
            onBack={() => dispatch({ type: 'START_OVER' })}
            onViewDetails={(id) => router.push(`/restaurant/${id}`)}
          />
        ) : (
          <RestaurantSwiper
            matches={matches}
            currentIndex={currentIndex}
            savedCount={savedRestaurants.length}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            onShuffle={handleShuffle}
          />
        )}
      </div>

      {/* Modals */}
      <ParticipantSelector
        open={showParticipantSelector}
        selected={selectedParticipants}
        currentUser={currentUser}
        onClose={() => dispatch({ type: 'CLOSE_PARTICIPANT_SELECTOR' })}
        onConfirm={handleParticipantsConfirm}
      />

      <ConfirmationModal
        open={showConfirmationModal}
        match={selectedMatch || undefined}
        participants={selectedParticipants}
        onClose={() => dispatch({ type: 'KEEP_SWIPING' })}
        onKeepSwiping={handleKeepSwiping}
      />

      <CategorySelectionModal
        open={showCategoryModal}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: 'RESET' });
        }}
      />
    </div>
  );
}
