/**
 * Network Monitor
 *
 * Provides network connectivity monitoring for React Native using NetInfo.
 * Used by the data provider to determine whether to use Supabase or cached/mock data.
 */

import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';

export type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'offline';

// Cached network state for synchronous access
let cachedNetworkState: NetInfoState | null = null;

// Initialize network state listener
const unsubscribe = NetInfo.addEventListener((state) => {
  cachedNetworkState = state;
});

/**
 * Check if the device is currently online
 * Uses cached state for fast synchronous access
 */
export function isOnline(): boolean {
  if (!cachedNetworkState) return true; // Assume online until first check
  return cachedNetworkState.isConnected ?? false;
}

/**
 * Check if the device is connected via WiFi
 */
export function isWifi(): boolean {
  if (!cachedNetworkState) return false;
  return cachedNetworkState.type === NetInfoStateType.wifi;
}

/**
 * Get the current connection quality based on network type
 */
export function getConnectionQuality(): ConnectionQuality {
  if (!cachedNetworkState || !cachedNetworkState.isConnected) {
    return 'offline';
  }

  const { type, details } = cachedNetworkState;

  // WiFi is generally excellent
  if (type === NetInfoStateType.wifi) {
    return 'excellent';
  }

  // Cellular - check generation
  if (type === NetInfoStateType.cellular && details) {
    const cellularGeneration = (details as { cellularGeneration?: string }).cellularGeneration;

    if (cellularGeneration === '5g' || cellularGeneration === '4g') {
      return 'good';
    }
    if (cellularGeneration === '3g') {
      return 'poor';
    }
    // 2g or unknown
    return 'poor';
  }

  // Ethernet or other wired connections
  if (type === NetInfoStateType.ethernet) {
    return 'excellent';
  }

  // Default to good for unknown connection types
  return 'good';
}

/**
 * Get the current network state (async, fresh check)
 */
export async function getNetworkState(): Promise<NetInfoState> {
  const state = await NetInfo.fetch();
  cachedNetworkState = state;
  return state;
}

/**
 * Subscribe to network state changes
 * @returns Unsubscribe function
 */
export function subscribeToNetworkChanges(
  callback: (state: NetInfoState) => void
): () => void {
  return NetInfo.addEventListener(callback);
}

/**
 * Get detailed network status for debugging
 */
export async function getNetworkStatus(): Promise<{
  isConnected: boolean;
  type: string;
  quality: ConnectionQuality;
  isWifi: boolean;
  details: unknown;
}> {
  const state = await getNetworkState();

  return {
    isConnected: state.isConnected ?? false,
    type: state.type,
    quality: getConnectionQuality(),
    isWifi: state.type === NetInfoStateType.wifi,
    details: state.details,
  };
}

// Cleanup function (call when app unmounts if needed)
export function cleanup(): void {
  unsubscribe();
}
