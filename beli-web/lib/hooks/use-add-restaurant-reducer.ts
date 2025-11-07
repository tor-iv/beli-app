import { useReducer } from 'react';

import type {
  RatingType,
  ListTypeKey,
} from '@/components/modals/add-restaurant/initial-rating-step';
import type { RankedRestaurant, RankingState } from '@/types';
import type { Reducer } from 'react';

// Modal phases
export type ModalPhase = 'initial' | 'ranking' | 'complete';

// State interface
export interface AddRestaurantState {
  phase: ModalPhase;
  rating: RatingType | null;
  listType: ListTypeKey;
  stealthMode: boolean;
  rankingState: RankingState | null;
  currentComparison: RankedRestaurant | null;
  loading: boolean;
  error: string | null;
}

// Action types
export type AddRestaurantAction =
  | { type: 'SET_RATING'; rating: RatingType }
  | { type: 'SET_LIST_TYPE'; listType: ListTypeKey }
  | { type: 'TOGGLE_STEALTH_MODE' }
  | { type: 'START_RANKING'; rankingState: RankingState; firstComparison: RankedRestaurant }
  | { type: 'UPDATE_RANKING'; rankingState: RankingState; nextComparison: RankedRestaurant | null }
  | { type: 'COMPLETE_RANKING' }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESET' };

// Initial state
export const initialAddRestaurantState: AddRestaurantState = {
  phase: 'initial',
  rating: null,
  listType: 'restaurants',
  stealthMode: false,
  rankingState: null,
  currentComparison: null,
  loading: false,
  error: null,
};

// Reducer function
const addRestaurantReducer: Reducer<AddRestaurantState, AddRestaurantAction> = (state, action) => {
  switch (action.type) {
    case 'SET_RATING':
      return {
        ...state,
        rating: action.rating,
      };

    case 'SET_LIST_TYPE':
      return {
        ...state,
        listType: action.listType,
      };

    case 'TOGGLE_STEALTH_MODE':
      return {
        ...state,
        stealthMode: !state.stealthMode,
      };

    case 'START_RANKING':
      return {
        ...state,
        phase: 'ranking',
        rankingState: action.rankingState,
        currentComparison: action.firstComparison,
        loading: false,
        error: null,
      };

    case 'UPDATE_RANKING':
      // If no next comparison, we're complete
      if (!action.nextComparison) {
        return {
          ...state,
          phase: 'complete',
          rankingState: action.rankingState,
          currentComparison: null,
        };
      }
      return {
        ...state,
        rankingState: action.rankingState,
        currentComparison: action.nextComparison,
      };

    case 'COMPLETE_RANKING':
      return {
        ...state,
        phase: 'complete',
        currentComparison: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.loading,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        loading: false,
      };

    case 'RESET':
      return initialAddRestaurantState;

    default:
      return state;
  }
};

// Custom hook
export function useAddRestaurantReducer() {
  return useReducer(addRestaurantReducer, initialAddRestaurantState);
}
