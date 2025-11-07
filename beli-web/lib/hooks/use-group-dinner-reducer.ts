import { useReducer } from 'react';

import type { User, GroupDinnerMatch, ListCategory } from '@/types';
import type { Reducer } from 'react';

// Phase-based state machine
export type GroupDinnerPhase =
  | 'loading' // Initial load
  | 'category-selection' // Selecting restaurant category
  | 'swiping' // Active swiping phase
  | 'selection' // Choosing from 3 saved restaurants
  | 'confirmation'; // Final confirmation

// State interface
export interface GroupDinnerState {
  phase: GroupDinnerPhase;
  user: User | null;
  participants: User[];
  category: ListCategory;
  matches: GroupDinnerMatch[];
  currentIndex: number;
  savedMatches: GroupDinnerMatch[];
  selectedMatch: GroupDinnerMatch | null;
  showParticipantSelector: boolean;
  error: string | null;
}

// Action types
export type GroupDinnerAction =
  | { type: 'INIT_SUCCESS'; user: User }
  | { type: 'INIT_ERROR'; error: string }
  | { type: 'SELECT_CATEGORY'; category: ListCategory }
  | { type: 'LOAD_MATCHES'; matches: GroupDinnerMatch[] }
  | { type: 'SWIPE_RIGHT'; match: GroupDinnerMatch }
  | { type: 'SWIPE_LEFT' }
  | { type: 'SELECT_MATCH'; match: GroupDinnerMatch }
  | { type: 'CONFIRM_MATCH' }
  | { type: 'KEEP_SWIPING' }
  | { type: 'SHUFFLE'; matches: GroupDinnerMatch[] }
  | { type: 'START_OVER' }
  | { type: 'OPEN_PARTICIPANT_SELECTOR' }
  | { type: 'CLOSE_PARTICIPANT_SELECTOR' }
  | { type: 'UPDATE_PARTICIPANTS'; participants: User[] }
  | { type: 'RESET' };

// Initial state
export const initialGroupDinnerState: GroupDinnerState = {
  phase: 'loading',
  user: null,
  participants: [],
  category: 'restaurants',
  matches: [],
  currentIndex: 0,
  savedMatches: [],
  selectedMatch: null,
  showParticipantSelector: false,
  error: null,
};

// Reducer function
const groupDinnerReducer: Reducer<GroupDinnerState, GroupDinnerAction> = (state, action) => {
  switch (action.type) {
    case 'INIT_SUCCESS':
      return {
        ...state,
        phase: 'category-selection',
        user: action.user,
        error: null,
      };

    case 'INIT_ERROR':
      return {
        ...state,
        phase: 'loading',
        error: action.error,
      };

    case 'SELECT_CATEGORY':
      return {
        ...state,
        category: action.category,
        phase: 'loading', // Will transition to swiping when matches load
        savedMatches: [], // Reset saved matches when changing category
      };

    case 'LOAD_MATCHES':
      return {
        ...state,
        phase: 'swiping',
        matches: action.matches,
        currentIndex: 0,
      };

    case 'SWIPE_RIGHT': {
      const newSaved = [...state.savedMatches, action.match];
      const nextIndex = state.currentIndex + 1;

      // If we have 3 saved, move to selection phase
      if (newSaved.length === 3) {
        return {
          ...state,
          phase: 'selection',
          savedMatches: newSaved,
          currentIndex: nextIndex,
        };
      }

      return {
        ...state,
        savedMatches: newSaved,
        currentIndex: nextIndex,
      };
    }

    case 'SWIPE_LEFT':
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
      };

    case 'SELECT_MATCH':
      return {
        ...state,
        phase: 'confirmation',
        selectedMatch: action.match,
      };

    case 'CONFIRM_MATCH':
      // Final confirmation - could close modal or navigate
      return {
        ...state,
        // Stays in confirmation phase - parent handles navigation
      };

    case 'KEEP_SWIPING':
      return {
        ...state,
        phase: 'swiping',
        selectedMatch: null,
      };

    case 'SHUFFLE':
      return {
        ...state,
        phase: 'swiping',
        matches: action.matches,
        currentIndex: 0,
        savedMatches: [],
      };

    case 'START_OVER':
      return {
        ...state,
        phase: 'swiping',
        savedMatches: [],
        currentIndex: 0,
      };

    case 'OPEN_PARTICIPANT_SELECTOR':
      return {
        ...state,
        showParticipantSelector: true,
      };

    case 'CLOSE_PARTICIPANT_SELECTOR':
      return {
        ...state,
        showParticipantSelector: false,
      };

    case 'UPDATE_PARTICIPANTS':
      return {
        ...state,
        participants: action.participants,
        showParticipantSelector: false,
        phase: 'loading', // Will reload matches with new participants
      };

    case 'RESET':
      return {
        ...initialGroupDinnerState,
        user: state.user, // Preserve user
      };

    default:
      return state;
  }
};

// Custom hook
export function useGroupDinnerReducer() {
  return useReducer(groupDinnerReducer, initialGroupDinnerState);
}
