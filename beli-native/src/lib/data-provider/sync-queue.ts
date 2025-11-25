/**
 * Sync Queue Processor
 *
 * Processes pending mutations when the device comes back online.
 * Implements exponential backoff for failed requests.
 */

import { useSyncStore, PendingMutation, MutationType } from '../store/syncStore';
import { subscribeToNetworkChanges, isOnline, getConnectionQuality } from './network-monitor';

// Mutation handlers - will be populated by services
type MutationHandler = (payload: Record<string, unknown>) => Promise<void>;
const mutationHandlers: Map<MutationType, MutationHandler> = new Map();

/**
 * Register a handler for a mutation type
 * Called by services to register their mutation handlers
 */
export function registerMutationHandler(
  type: MutationType,
  handler: MutationHandler
): void {
  mutationHandlers.set(type, handler);
}

/**
 * Calculate delay with exponential backoff
 */
function getBackoffDelay(retryCount: number): number {
  // Base delay of 1 second, doubles with each retry, max 30 seconds
  return Math.min(1000 * Math.pow(2, retryCount), 30000);
}

/**
 * Process a single mutation
 */
async function processMutation(mutation: PendingMutation): Promise<boolean> {
  const handler = mutationHandlers.get(mutation.type);

  if (!handler) {
    console.warn(`[SyncQueue] No handler registered for mutation type: ${mutation.type}`);
    return false;
  }

  try {
    await handler(mutation.payload);
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`[SyncQueue] Mutation ${mutation.id} failed:`, errorMsg);
    useSyncStore.getState().incrementRetry(mutation.id, errorMsg);
    return false;
  }
}

/**
 * Process all pending mutations
 */
export async function processPendingMutations(): Promise<{
  processed: number;
  failed: number;
}> {
  const store = useSyncStore.getState();

  // Don't process if already syncing
  if (store.isSyncing) {
    return { processed: 0, failed: 0 };
  }

  // Don't process if offline
  if (!isOnline()) {
    return { processed: 0, failed: 0 };
  }

  // Don't process on poor connections
  const quality = getConnectionQuality();
  if (quality === 'poor') {
    console.log('[SyncQueue] Skipping sync on poor connection');
    return { processed: 0, failed: 0 };
  }

  const mutations = [...store.pendingMutations];
  if (mutations.length === 0) {
    return { processed: 0, failed: 0 };
  }

  store.setIsSyncing(true);
  let processed = 0;
  let failed = 0;

  try {
    for (const mutation of mutations) {
      // Add backoff delay for retried mutations
      if (mutation.retryCount > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, getBackoffDelay(mutation.retryCount))
        );
      }

      // Check if we're still online
      if (!isOnline()) {
        console.log('[SyncQueue] Lost connection, stopping sync');
        break;
      }

      const success = await processMutation(mutation);

      if (success) {
        store.removeMutation(mutation.id);
        processed++;
      } else {
        failed++;
      }
    }

    store.setLastSync(Date.now(), failed > 0 ? `${failed} mutations failed` : undefined);
  } finally {
    store.setIsSyncing(false);
  }

  return { processed, failed };
}

// Track if sync queue listener is initialized
let isInitialized = false;

/**
 * Initialize the sync queue listener
 * Should be called once when the app starts
 */
export function initializeSyncQueue(): () => void {
  if (isInitialized) {
    console.warn('[SyncQueue] Already initialized');
    return () => {};
  }

  isInitialized = true;
  console.log('[SyncQueue] Initializing sync queue listener');

  // Subscribe to network changes
  const unsubscribe = subscribeToNetworkChanges(async (state) => {
    if (state.isConnected) {
      console.log('[SyncQueue] Network connected, processing pending mutations...');
      // Small delay to ensure connection is stable
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (isOnline()) {
        const result = await processPendingMutations();
        if (result.processed > 0) {
          console.log(`[SyncQueue] Synced ${result.processed} mutations`);
        }
      }
    }
  });

  // Process any existing mutations on startup if online
  if (isOnline()) {
    setTimeout(() => {
      processPendingMutations().then((result) => {
        if (result.processed > 0) {
          console.log(`[SyncQueue] Startup sync: ${result.processed} mutations`);
        }
      });
    }, 2000); // Delay to allow app to fully initialize
  }

  return () => {
    isInitialized = false;
    unsubscribe();
  };
}

/**
 * Manually trigger sync (useful for pull-to-refresh)
 */
export async function triggerSync(): Promise<{ processed: number; failed: number }> {
  return processPendingMutations();
}

/**
 * Get sync status for UI display
 */
export function getSyncStatus(): {
  pendingCount: number;
  isSyncing: boolean;
  lastSyncAt: number | null;
  lastError: string | null;
} {
  const state = useSyncStore.getState();
  return {
    pendingCount: state.pendingMutations.length,
    isSyncing: state.isSyncing,
    lastSyncAt: state.lastSyncAt,
    lastError: state.lastSyncError,
  };
}
