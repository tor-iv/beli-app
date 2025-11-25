/**
 * Query Provider
 *
 * React Query provider configured for React Native.
 * Wraps the app to enable data fetching hooks.
 */

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { initializeSyncQueue } from '../data-provider/sync-queue';

/**
 * Configure React Query's online manager to use NetInfo
 * This tells React Query when the device is online/offline
 */
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

/**
 * Create a QueryClient with mobile-optimized defaults
 */
function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes before considering stale
        staleTime: 5 * 60 * 1000,
        // Keep unused data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed requests once
        retry: 1,
        // Custom retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Don't refetch on window focus (not applicable for mobile)
        refetchOnWindowFocus: false,
        // Refetch when network reconnects
        refetchOnReconnect: true,
        // Network mode: prefer cache when offline
        networkMode: 'offlineFirst',
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
        // Network mode for mutations
        networkMode: 'offlineFirst',
      },
    },
  });
}

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Query Provider Component
 *
 * Provides React Query client to the app and initializes the sync queue.
 */
export function QueryProvider({ children }: QueryProviderProps): React.ReactElement {
  // Create query client once and persist across renders
  const [queryClient] = useState(() => createQueryClient());

  // Initialize sync queue for offline mutations
  useEffect(() => {
    const cleanup = initializeSyncQueue();
    return cleanup;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default QueryProvider;
