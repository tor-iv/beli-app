'use client';

import { useCallback, useEffect, useState } from 'react';

export type GeolocationStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'error';

export interface GeolocationCoordinates {
  lat: number;
  lng: number;
}

export interface UseGeolocationOptions {
  /** Automatically request location on mount */
  autoRequest?: boolean;
  /** Enable high accuracy mode (slower but more precise) */
  enableHighAccuracy?: boolean;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Maximum age of cached position in milliseconds */
  maximumAge?: number;
}

export interface UseGeolocationReturn {
  /** Current coordinates if available */
  coordinates: GeolocationCoordinates | null;
  /** Current status of geolocation request */
  status: GeolocationStatus;
  /** Error message if any */
  error: string | null;
  /** Manually request location */
  requestLocation: () => void;
  /** Clear current location data */
  clearLocation: () => void;
  /** Whether browser supports geolocation */
  isSupported: boolean;
}

const DEFAULT_OPTIONS: UseGeolocationOptions = {
  autoRequest: false,
  enableHighAccuracy: false,
  timeout: 5000,
  maximumAge: 60000, // Cache position for 1 minute
};

/**
 * Hook for accessing browser geolocation API
 *
 * @example
 * ```tsx
 * const { coordinates, status, requestLocation } = useGeolocation({ autoRequest: true });
 *
 * if (status === 'requesting') return <Spinner />;
 * if (status === 'granted' && coordinates) {
 *   return <p>You're at {coordinates.lat}, {coordinates.lng}</p>;
 * }
 * ```
 */
export function useGeolocation(
  options: UseGeolocationOptions = {}
): UseGeolocationReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(
    null
  );
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const isSupported =
    typeof window !== 'undefined' && 'geolocation' in navigator;

  const requestLocation = useCallback(() => {
    if (!isSupported) {
      setStatus('error');
      setError('Geolocation is not supported by your browser');
      return;
    }

    setStatus('requesting');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setStatus('granted');
        setError(null);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setStatus('denied');
            setError('Location access denied');
            break;
          case err.POSITION_UNAVAILABLE:
            setStatus('error');
            setError('Location information unavailable');
            break;
          case err.TIMEOUT:
            setStatus('error');
            setError('Location request timed out');
            break;
          default:
            setStatus('error');
            setError('An unknown error occurred');
        }
      },
      {
        enableHighAccuracy: opts.enableHighAccuracy,
        timeout: opts.timeout,
        maximumAge: opts.maximumAge,
      }
    );
  }, [isSupported, opts.enableHighAccuracy, opts.timeout, opts.maximumAge]);

  const clearLocation = useCallback(() => {
    setCoordinates(null);
    setStatus('idle');
    setError(null);
  }, []);

  // Auto-request on mount if enabled
  useEffect(() => {
    if (opts.autoRequest && isSupported && status === 'idle') {
      requestLocation();
    }
  }, [opts.autoRequest, isSupported, status, requestLocation]);

  return {
    coordinates,
    status,
    error,
    requestLocation,
    clearLocation,
    isSupported,
  };
}
