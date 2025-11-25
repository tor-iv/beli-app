import { useReducer } from 'react';

import type {
  RatingType,
  ListTypeKey,
} from '@/components/modals/add-restaurant/initial-rating-step';
import type { RankedRestaurant, RankingState, User } from '@/types';
import type { Reducer } from 'react';

// Modal types for sub-dialogs
export type ActiveModalType = 'notes' | 'companions' | 'tags' | 'visitDate' | null;

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
  // Metadata fields
  notes: string;
  companions: User[];
  tags: string[];
  visitDate: Date | null;
  // Active sub-dialog
  activeModal: ActiveModalType;
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
  | { type: 'RESET' }
  // Metadata actions
  | { type: 'SET_NOTES'; notes: string }
  | { type: 'SET_COMPANIONS'; companions: User[] }
  | { type: 'SET_TAGS'; tags: string[] }
  | { type: 'SET_VISIT_DATE'; visitDate: Date | null }
  | { type: 'OPEN_MODAL'; modal: ActiveModalType }
  | { type: 'CLOSE_MODAL' };

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
  // Metadata defaults
  notes: '',
  companions: [],
  tags: [],
  visitDate: null,
  activeModal: null,
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

    // Metadata actions
    case 'SET_NOTES':
      return {
        ...state,
        notes: action.notes,
      };

    case 'SET_COMPANIONS':
      return {
        ...state,
        companions: action.companions,
      };

    case 'SET_TAGS':
      return {
        ...state,
        tags: action.tags,
      };

    case 'SET_VISIT_DATE':
      return {
        ...state,
        visitDate: action.visitDate,
      };

    case 'OPEN_MODAL':
      return {
        ...state,
        activeModal: action.modal,
      };

    case 'CLOSE_MODAL':
      return {
        ...state,
        activeModal: null,
      };

    default:
      return state;
  }
};

// Custom hook
export function useAddRestaurantReducer() {
  return useReducer(addRestaurantReducer, initialAddRestaurantState);
}
