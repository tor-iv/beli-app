/**
 * Network Status Hook
 *
 * Hook for monitoring network connectivity status.
 * Useful for showing offline indicators in the UI.
 */

import { useState, useEffect } from 'react';
import {
  isOnline,
  getConnectionQuality,
  ConnectionQuality,
  subscribeToNetworkChanges,
} from '../data-provider';
import { getSyncStatus } from '../data-provider/sync-queue';

export interface NetworkStatus {
  isOnline: boolean;
  connectionQuality: ConnectionQuality;
  pendingMutations: number;
  isSyncing: boolean;
}

/**
 * Hook to get current network status
 * Updates automatically when network state changes
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: isOnline(),
    connectionQuality: getConnectionQuality(),
    pendingMutations: 0,
    isSyncing: false,
  });

  useEffect(() => {
    // Subscribe to network changes
    const unsubscribe = subscribeToNetworkChanges(() => {
      const syncStatus = getSyncStatus();
      setStatus({
        isOnline: isOnline(),
        connectionQuality: getConnectionQuality(),
        pendingMutations: syncStatus.pendingCount,
        isSyncing: syncStatus.isSyncing,
      });
    });

    // Update sync status periodically
    const interval = setInterval(() => {
      const syncStatus = getSyncStatus();
      setStatus((prev) => ({
        ...prev,
        pendingMutations: syncStatus.pendingCount,
        isSyncing: syncStatus.isSyncing,
      }));
    }, 5000); // Check every 5 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return status;
}

/**
 * Simple hook to check if online
 */
export function useIsOnline(): boolean {
  const { isOnline } = useNetworkStatus();
  return isOnline;
}

/**
 * Hook to check if there are pending offline mutations
 */
export function usePendingMutations(): number {
  const { pendingMutations } = useNetworkStatus();
  return pendingMutations;
}
