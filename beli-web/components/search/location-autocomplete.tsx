'use client';

import { Building2, Loader2, MapPin, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { CITIES, DEFAULT_CITY, searchCities, type City } from '@/lib/constants/cities';
import type { GeolocationStatus } from '@/lib/hooks/use-geolocation';
import { cn } from '@/lib/utils';

export interface SelectedLocation {
  type: 'current' | 'city';
  displayName: string;
  coordinates: { lat: number; lng: number };
}

interface LocationAutocompleteProps {
  /** Display value for the input */
  value: string;
  /** Called when a location is selected */
  onLocationSelect: (location: SelectedLocation) => void;
  /** Current geolocation status */
  geoStatus: GeolocationStatus;
  /** User's GPS coordinates (if available) */
  geoCoordinates?: { lat: number; lng: number } | null;
  /** Request geolocation permission */
  onRequestLocation?: () => void;
  className?: string;
}

export function LocationAutocomplete({
  value,
  onLocationSelect,
  geoStatus,
  geoCoordinates,
  onRequestLocation,
  className,
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter cities based on input
  const filteredCities = searchCities(inputValue === value ? '' : inputValue);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // Reset input to current value if closing without selection
        setInputValue(value);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const handleSelectCurrentLocation = useCallback(() => {
    if (geoStatus === 'granted' && geoCoordinates) {
      onLocationSelect({
        type: 'current',
        displayName: 'Current Location',
        coordinates: geoCoordinates,
      });
      setInputValue('Current Location');
      setIsOpen(false);
    } else if (geoStatus === 'idle' || geoStatus === 'denied' || geoStatus === 'error') {
      // Request location permission
      onRequestLocation?.();
    }
  }, [geoStatus, geoCoordinates, onLocationSelect, onRequestLocation]);

  const handleSelectCity = useCallback(
    (city: City) => {
      onLocationSelect({
        type: 'city',
        displayName: city.displayName,
        coordinates: city.coordinates,
      });
      setInputValue(city.displayName);
      setIsOpen(false);
    },
    [onLocationSelect]
  );

  const handleClear = useCallback(() => {
    // Reset to default city
    onLocationSelect({
      type: 'city',
      displayName: DEFAULT_CITY.displayName,
      coordinates: DEFAULT_CITY.coordinates,
    });
    setInputValue(DEFAULT_CITY.displayName);
  }, [onLocationSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    const totalItems = (geoStatus !== 'denied' ? 1 : 0) + filteredCities.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + totalItems) % totalItems);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex === 0 && geoStatus !== 'denied') {
          handleSelectCurrentLocation();
        } else {
          const cityIndex = geoStatus !== 'denied' ? highlightedIndex - 1 : highlightedIndex;
          if (filteredCities[cityIndex]) {
            handleSelectCity(filteredCities[cityIndex]);
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setInputValue(value);
        inputRef.current?.blur();
        break;
    }
  };

  const getCurrentLocationLabel = () => {
    switch (geoStatus) {
      case 'requesting':
        return 'Getting location...';
      case 'denied':
        return 'Location access denied';
      case 'error':
        return 'Location unavailable';
      default:
        return 'Current Location';
    }
  };

  const canUseCurrentLocation = geoStatus === 'granted' || geoStatus === 'idle' || geoStatus === 'requesting';

  return (
    <div className={cn('relative', className)}>
      {/* Input */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search cities..."
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="h-12 pl-10 pr-10 text-base"
        />
        {geoStatus === 'requesting' && (
          <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-muted" />
        )}
        {geoStatus !== 'requesting' && inputValue && inputValue !== 'Current Location' && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-5 w-5 text-muted hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-full z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {/* Current Location Option */}
          {geoStatus !== 'denied' && (
            <button
              type="button"
              onClick={handleSelectCurrentLocation}
              disabled={geoStatus === 'requesting'}
              className={cn(
                'flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors',
                highlightedIndex === 0 && 'bg-gray-50',
                geoStatus === 'requesting' && 'cursor-wait opacity-70',
                geoStatus !== 'requesting' && 'hover:bg-gray-50'
              )}
            >
              {geoStatus === 'requesting' ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <MapPin className="h-5 w-5 text-primary" />
              )}
              <div className="flex-1">
                <span className="font-medium">{getCurrentLocationLabel()}</span>
                {geoStatus === 'granted' && (
                  <span className="ml-2 text-sm text-muted">Using GPS</span>
                )}
              </div>
            </button>
          )}

          {/* Permission denied message */}
          {geoStatus === 'denied' && (
            <div className="border-b border-gray-100 px-4 py-3 text-sm text-muted">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>Location access denied. Select a city below.</span>
              </div>
            </div>
          )}

          {/* City List */}
          {filteredCities.length > 0 ? (
            filteredCities.map((city, index) => {
              const itemIndex = geoStatus !== 'denied' ? index + 1 : index;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleSelectCity(city)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50',
                    highlightedIndex === itemIndex && 'bg-gray-50'
                  )}
                >
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <span>{city.displayName}</span>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-3 text-sm text-muted">No cities found</div>
          )}
        </div>
      )}
    </div>
  );
}
