import { useReducer } from 'react';

import type { Restaurant } from '@/types';
import type { Reducer } from 'react';

// List types
export type ListType =
  | 'been'
  | 'want_to_try'
  | 'recs'
  | 'playlists'
  | 'recs_for_you'
  | 'recs_from_friends'
  | 'trending';
export type RightPanelView = 'detail' | 'map';

// State interface
export interface ListsState {
  activeTab: ListType;
  selectedRestaurant: Restaurant | null;
  rightPanelView: RightPanelView;
  isListPickerOpen: boolean;
  isInMoreView: boolean;
}

// Action types
export type ListsAction =
  | { type: 'SET_TAB'; tab: ListType; inMoreView?: boolean }
  | { type: 'SELECT_RESTAURANT'; restaurant: Restaurant | null }
  | { type: 'AUTO_SELECT_FIRST'; restaurant: Restaurant }
  | { type: 'TOGGLE_VIEW'; view: RightPanelView }
  | { type: 'TOGGLE_LIST_PICKER'; open: boolean }
  | { type: 'OPEN_MORE_LIST'; tab: ListType }
  | { type: 'RESET_SELECTION' };

// Initial state
export const initialListsState: ListsState = {
  activeTab: 'been',
  selectedRestaurant: null,
  rightPanelView: 'detail',
  isListPickerOpen: false,
  isInMoreView: false,
};

// Reducer function
const listsReducer: Reducer<ListsState, ListsAction> = (state, action) => {
  switch (action.type) {
    case 'SET_TAB':
      return {
        ...state,
        activeTab: action.tab,
        isInMoreView: action.inMoreView ?? false,
        // Reset selection when changing tabs
        selectedRestaurant: null,
      };

    case 'SELECT_RESTAURANT':
      return {
        ...state,
        selectedRestaurant: action.restaurant,
      };

    case 'AUTO_SELECT_FIRST':
      // Only auto-select if no restaurant is currently selected
      return {
        ...state,
        selectedRestaurant: state.selectedRestaurant ?? action.restaurant,
      };

    case 'TOGGLE_VIEW':
      return {
        ...state,
        rightPanelView: action.view,
      };

    case 'TOGGLE_LIST_PICKER':
      return {
        ...state,
        isListPickerOpen: action.open,
      };

    case 'OPEN_MORE_LIST':
      // Used for special lists (recs_for_you, recs_from_friends, trending)
      return {
        ...state,
        activeTab: action.tab,
        isInMoreView: true,
        isListPickerOpen: false,
        selectedRestaurant: null,
      };

    case 'RESET_SELECTION':
      return {
        ...state,
        selectedRestaurant: null,
      };

    default:
      return state;
  }
};

// Custom hook
export function useListsReducer(initialTab: ListType = 'been') {
  return useReducer(listsReducer, {
    ...initialListsState,
    activeTab: initialTab,
  });
}
