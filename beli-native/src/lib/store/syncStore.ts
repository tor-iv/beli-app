/**
 * Sync Store
 *
 * Zustand store for managing offline mutation queue.
 * Mutations are stored persistently and synced when back online.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export type MutationType =
  | 'like_activity'
  | 'unlike_activity'
  | 'bookmark_activity'
  | 'unbookmark_activity'
  | 'add_comment'
  | 'follow_user'
  | 'unfollow_user'
  | 'add_to_list'
  | 'remove_from_list'
  | 'create_list'
  | 'add_review'
  | 'bookmark_post'
  | 'unbookmark_post'
  | 'like_post'
  | 'unlike_post'
  | 'mark_notification_read'
  | 'mark_been'
  | 'mark_want_to_try'
  | 'update_rating'
  | 'remove_relation';

export interface PendingMutation {
  id: string;
  type: MutationType;
  payload: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
  lastError?: string;
}

export interface SyncStore {
  // State
  pendingMutations: PendingMutation[];
  isSyncing: boolean;
  lastSyncAt: number | null;
  lastSyncError: string | null;

  // Actions
  addMutation: (type: MutationType, payload: Record<string, unknown>) => string;
  removeMutation: (id: string) => void;
  incrementRetry: (id: string, error?: string) => void;
  setIsSyncing: (syncing: boolean) => void;
  setLastSync: (timestamp: number, error?: string) => void;
  clearAllMutations: () => void;
  getMutationsByType: (type: MutationType) => PendingMutation[];
}

const MAX_RETRY_COUNT = 3;

export const useSyncStore = create<SyncStore>()(
  persist(
    (set, get) => ({
      // Initial state
      pendingMutations: [],
      isSyncing: false,
      lastSyncAt: null,
      lastSyncError: null,

      // Add a new mutation to the queue
      addMutation: (type, payload) => {
        const id = uuidv4();
        const mutation: PendingMutation = {
          id,
          type,
          payload,
          createdAt: Date.now(),
          retryCount: 0,
        };

        set((state) => ({
          pendingMutations: [...state.pendingMutations, mutation],
        }));

        return id;
      },

      // Remove a mutation (after successful sync)
      removeMutation: (id) => {
        set((state) => ({
          pendingMutations: state.pendingMutations.filter((m) => m.id !== id),
        }));
      },

      // Increment retry count (after failed sync attempt)
      incrementRetry: (id, error) => {
        set((state) => ({
          pendingMutations: state.pendingMutations.map((m) =>
            m.id === id
              ? {
                  ...m,
                  retryCount: m.retryCount + 1,
                  lastError: error,
                }
              : m
          ).filter((m) => m.retryCount < MAX_RETRY_COUNT), // Remove after max retries
        }));
      },

      // Set syncing state
      setIsSyncing: (syncing) => {
        set({ isSyncing: syncing });
      },

      // Record last sync attempt
      setLastSync: (timestamp, error) => {
        set({
          lastSyncAt: timestamp,
          lastSyncError: error || null,
        });
      },

      // Clear all pending mutations (for debugging/reset)
      clearAllMutations: () => {
        set({
          pendingMutations: [],
          lastSyncError: null,
        });
      },

      // Get mutations by type
      getMutationsByType: (type) => {
        return get().pendingMutations.filter((m) => m.type === type);
      },
    }),
    {
      name: 'beli-sync-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist these fields
      partialize: (state) => ({
        pendingMutations: state.pendingMutations,
        lastSyncAt: state.lastSyncAt,
      }),
    }
  )
);

/**
 * Get the count of pending mutations
 */
export function getPendingMutationCount(): number {
  return useSyncStore.getState().pendingMutations.length;
}

/**
 * Check if there are pending mutations
 */
export function hasPendingMutations(): boolean {
  return useSyncStore.getState().pendingMutations.length > 0;
}
