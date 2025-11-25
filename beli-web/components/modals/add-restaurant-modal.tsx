'use client';

import * as React from 'react';

import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetTitle,
  BottomSheetClose,
} from '@/components/ui/bottom-sheet';
import { useRankedRestaurants, useUser } from '@/lib/hooks';
import { useAddRestaurantReducer } from '@/lib/hooks/use-add-restaurant-reducer';
import {
  initializeRanking,
  getNextComparison,
  processComparison,
  undoLastComparison,
  generateRankingResult,
} from '@/lib/utils/binarySearchRanking';

import {
  InitialRatingStep,
  type RatingType,
  type ListTypeKey,
} from './add-restaurant/initial-rating-step';
import { RankingComparisonStep } from './add-restaurant/ranking-comparison-step';
import { RankingControls } from './add-restaurant/ranking-controls';
import { NotesDialog } from './add-restaurant/notes-dialog';
import { TagsDialog } from './add-restaurant/tags-dialog';
import { CompanionsDialog } from './add-restaurant/companions-dialog';
import { VisitDateDialog } from './add-restaurant/visit-date-dialog';


import type {
  Restaurant as RestaurantType,
  RankedRestaurant,
  RankingState,
  RankingResult,
  InitialSentiment,
} from '@/types';

export interface RestaurantSubmissionData {
  rating: 'liked' | 'fine' | 'disliked' | null;
  listType: 'restaurants' | 'bars' | 'bakeries' | 'coffee_tea' | 'dessert' | 'other';
  companions: string[];
  labels: string[];
  notes: string;
  favoriteDishes: string[];
  photos: string[];
  visitDate: Date | null;
  stealthMode: boolean;
}

interface AddRestaurantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: RestaurantType;
  userId: string;
  onSubmit?: (data: RestaurantSubmissionData) => void;
  onRankingComplete?: (result: RankingResult, data: RestaurantSubmissionData) => void;
}

export const AddRestaurantModal = ({
  open,
  onOpenChange,
  restaurant,
  userId,
  onSubmit,
  onRankingComplete,
}: AddRestaurantModalProps) => {
  // Use reducer for modal state management
  const [state, dispatch] = useAddRestaurantReducer();
  const {
    phase,
    rating,
    listType,
    stealthMode,
    rankingState,
    currentComparison,
    loading,
    error,
    notes,
    companions,
    tags,
    visitDate,
    activeModal,
  } = state;

  // Fetch user data for companions dialog
  const { data: currentUser } = useUser(userId);

  // Fetch ranked restaurants for the ranking flow
  const { data: rankedList } = useRankedRestaurants(userId, listType);

  // Use key prop pattern instead of useEffect for state reset
  const modalKey = React.useMemo(() => {
    return open ? `${restaurant.id}-${Date.now()}` : 'closed';
  }, [open, restaurant.id]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!open) {
      // Small delay to allow closing animation
      const timer = setTimeout(() => {
        dispatch({ type: 'RESET' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const startRankingFlow = async () => {
    if (!rating || !onRankingComplete) return;

    dispatch({ type: 'SET_LOADING', loading: true });

    try {
      // Use the ranked list from the query
      const list: RankedRestaurant[] = rankedList || [];

      // Initialize ranking state
      const newRankingState = initializeRanking(
        restaurant.id,
        listType,
        list,
        rating as InitialSentiment
      );

      // Get first comparison
      const firstComparison = getNextComparison(newRankingState);

      // Ensure we have a valid comparison
      if (!firstComparison) {
        dispatch({ type: 'SET_ERROR', error: 'No restaurants to compare' });
        return;
      }

      // Switch to ranking mode with initialized state
      dispatch({
        type: 'START_RANKING',
        rankingState: newRankingState,
        firstComparison,
      });
    } catch (err) {
      console.error('Error initializing ranking:', err);
      dispatch({ type: 'SET_ERROR', error: 'Failed to start ranking flow. Please try again.' });
    }
  };

  const handleComparisonChoice = (choice: 'left' | 'right') => {
    if (!rankingState || !currentComparison) return;

    // Process the comparison
    const newState = processComparison(rankingState, currentComparison, choice);

    // Check if complete
    if (newState.isComplete) {
      handleRankingComplete(newState);
      return;
    }

    // Get next comparison
    const nextRestaurant = getNextComparison(newState);
    dispatch({ type: 'UPDATE_RANKING', rankingState: newState, nextComparison: nextRestaurant });
  };

  const handleSkip = () => {
    if (!rankingState || !currentComparison || rankingState.skipsRemaining <= 0) return;

    const newState = processComparison(rankingState, currentComparison, 'skip');

    if (newState.isComplete) {
      handleRankingComplete(newState);
      return;
    }

    const nextRestaurant = getNextComparison(newState);
    dispatch({ type: 'UPDATE_RANKING', rankingState: newState, nextComparison: nextRestaurant });
  };

  const handleTooTough = () => {
    if (!rankingState) return;

    // Stop ranking immediately and use current position
    const finalState: RankingState = {
      ...rankingState,
      isComplete: true,
    };

    handleRankingComplete(finalState);
  };

  const handleUndo = () => {
    if (!rankingState || rankingState.comparisonHistory.length === 0) return;

    const newState = undoLastComparison(rankingState);

    // Get the comparison restaurant again
    const nextRestaurant = getNextComparison(newState);
    dispatch({ type: 'UPDATE_RANKING', rankingState: newState, nextComparison: nextRestaurant });
  };

  const handleRankingComplete = (rankState: RankingState) => {
    if (!onRankingComplete) return;

    // Generate final result
    const result = generateRankingResult(rankState);

    // Create submission data with real state values
    const data: RestaurantSubmissionData = {
      rating,
      listType,
      companions: companions.map((c) => c.id),
      labels: tags,
      notes,
      favoriteDishes: [],
      photos: [],
      visitDate,
      stealthMode,
    };

    // Call the completion callback
    onRankingComplete(result, data);
  };

  const handleRankIt = () => {
    if (onRankingComplete && rating !== null) {
      // Start the ranking flow
      startRankingFlow();
    } else if (onSubmit) {
      // Old behavior - just submit with real state values
      const data: RestaurantSubmissionData = {
        rating,
        listType,
        companions: companions.map((c) => c.id),
        labels: tags,
        notes,
        favoriteDishes: [],
        photos: [],
        visitDate,
        stealthMode,
      };
      onSubmit(data);
      onOpenChange(false);
    }
  };

  return (
    <BottomSheet key={modalKey} open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent className="max-h-[90vh] overflow-y-auto">
        <BottomSheetTitle className="sr-only">Add {restaurant.name} to your list</BottomSheetTitle>
        <div className="space-y-3 p-4">
          {/* Header */}
          <div className="flex items-start justify-between rounded-2xl bg-white p-4">
            <div className="mr-3 flex-1">
              <h2 className="mb-1 text-xl font-bold text-foreground">{restaurant.name}</h2>
              <p className="text-sm text-secondary">
                {restaurant.priceRange} | {restaurant.cuisine.join(', ')}
              </p>
            </div>
            <BottomSheetClose className="rounded-full p-1 hover:bg-gray-100">
              <span className="sr-only">Close</span>
            </BottomSheetClose>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Initial Rating Step */}
          {phase === 'initial' && (
            <InitialRatingStep
              restaurant={restaurant}
              rating={rating}
              onRatingChange={(r) => dispatch({ type: 'SET_RATING', rating: r })}
              listType={listType}
              onListTypeChange={(lt) => dispatch({ type: 'SET_LIST_TYPE', listType: lt })}
              stealthMode={stealthMode}
              onStealthModeChange={() => dispatch({ type: 'TOGGLE_STEALTH_MODE' })}
              onSubmit={handleRankIt}
              isLoading={loading}
              notes={notes}
              companions={companions}
              tags={tags}
              visitDate={visitDate}
              onOpenModal={(modal) => dispatch({ type: 'OPEN_MODAL', modal })}
            />
          )}

          {/* Ranking Mode */}
          {phase === 'ranking' && rankingState && currentComparison && (
            <>
              <RankingComparisonStep
                targetRestaurant={restaurant}
                comparisonRestaurant={currentComparison}
                rankingState={rankingState}
                onChoice={handleComparisonChoice}
              />
              <RankingControls
                rankingState={rankingState}
                onUndo={handleUndo}
                onSkip={handleSkip}
                onTooTough={handleTooTough}
              />
            </>
          )}
        </div>
      </BottomSheetContent>

      {/* Sub-dialogs for metadata input */}
      <NotesDialog
        open={activeModal === 'notes'}
        onOpenChange={(open) => !open && dispatch({ type: 'CLOSE_MODAL' })}
        notes={notes}
        onSave={(newNotes) => dispatch({ type: 'SET_NOTES', notes: newNotes })}
      />

      <TagsDialog
        open={activeModal === 'tags'}
        onOpenChange={(open) => !open && dispatch({ type: 'CLOSE_MODAL' })}
        tags={tags}
        onSave={(newTags) => dispatch({ type: 'SET_TAGS', tags: newTags })}
      />

      {currentUser && (
        <CompanionsDialog
          open={activeModal === 'companions'}
          onOpenChange={(open) => !open && dispatch({ type: 'CLOSE_MODAL' })}
          companions={companions}
          currentUser={currentUser}
          onSave={(newCompanions) => dispatch({ type: 'SET_COMPANIONS', companions: newCompanions })}
        />
      )}

      <VisitDateDialog
        open={activeModal === 'visitDate'}
        onOpenChange={(open) => !open && dispatch({ type: 'CLOSE_MODAL' })}
        visitDate={visitDate}
        onSave={(newDate) => dispatch({ type: 'SET_VISIT_DATE', visitDate: newDate })}
      />
    </BottomSheet>
  );
}
