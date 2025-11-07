'use client';

import L from 'leaflet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

import { cn } from '@/lib/utils';

import type { Restaurant } from '@/types';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface RestaurantMapProps {
  restaurants: Restaurant[];
  selectedRestaurant?: Restaurant | null;
  onRestaurantSelect: (restaurant: Restaurant) => void;
  visibleRestaurants?: Restaurant[];
  className?: string;
}

// Helper function to get rating color - matches app design system
function getRatingColor(rating: number): string {
  if (rating >= 8.5) return '#22C55E'; // excellent (green-500)
  if (rating >= 7.0) return '#84CC16'; // good (lime-500)
  if (rating >= 5.0) return '#F59E0B'; // average (amber-500)
  return '#EF4444'; // poor (red-500)
}

// Custom marker icon component - bordered style matching rating bubbles
function createCustomIcon(rating: number, isSelected: boolean): L.DivIcon {
  const color = getRatingColor(rating);
  const size = isSelected ? 44 : 38;
  const fontSize = isSelected ? '15px' : '13px';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: white;
        border: 3px solid ${color};
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        color: ${color};
        font-size: ${fontSize};
        transition: all 0.2s ease;
        ${isSelected ? 'transform: scale(1.15); box-shadow: 0 4px 12px rgba(0,0,0,0.25); z-index: 1000;' : ''}
      ">
        ${rating.toFixed(1)}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Component to handle map bounds updates
const MapBoundsUpdater = ({ restaurants }: { restaurants: Restaurant[] }) => {
  const map = useMap();

  useEffect(() => {
    if (!restaurants || restaurants.length === 0) return;

    const coords = restaurants
      .map((r) => r.location?.coordinates)
      .filter((c): c is { lat: number; lng: number } => c !== undefined);

    if (coords.length === 0) {
      // Default to NYC
      map.setView([40.728334, -73.998045], 13);
      return;
    }

    if (coords.length === 1) {
      // Single restaurant - center with decent zoom
      map.setView([coords[0].lat, coords[0].lng], 15);
      return;
    }

    // Multiple restaurants - fit bounds
    const bounds = L.latLngBounds(coords.map((c) => [c.lat, c.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [restaurants, map]);

  return null;
}

export const RestaurantMap = ({
  restaurants,
  selectedRestaurant,
  onRestaurantSelect,
  visibleRestaurants,
  className,
}: RestaurantMapProps) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.728334, -73.998045]);
  const [mapZoom, setMapZoom] = useState(13);

  // Use visible restaurants if provided, otherwise all restaurants
  const displayRestaurants = useMemo(() => {
    return visibleRestaurants && visibleRestaurants.length > 0 ? visibleRestaurants : restaurants;
  }, [visibleRestaurants, restaurants]);

  // Filter restaurants with valid coordinates
  const restaurantsWithCoords = useMemo(() => {
    return displayRestaurants.filter(
      (r) => r.location?.coordinates?.lat && r.location?.coordinates?.lng
    );
  }, [displayRestaurants]);

  // Calculate initial map center
  useEffect(() => {
    if (restaurantsWithCoords.length === 0) return;

    const lats = restaurantsWithCoords.map((r) => r.location.coordinates!.lat);
    const lngs = restaurantsWithCoords.map((r) => r.location.coordinates!.lng);

    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

    setMapCenter([centerLat, centerLng]);
  }, [restaurantsWithCoords]);

  if (restaurantsWithCoords.length === 0) {
    return (
      <div
        className={cn('flex h-full items-center justify-center bg-gray-50 text-muted', className)}
      >
        <p>No restaurant locations available to display on map</p>
      </div>
    );
  }

  return (
    <div className={cn('relative h-full w-full', className)}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        <MapBoundsUpdater restaurants={restaurantsWithCoords} />

        {restaurantsWithCoords.map((restaurant) => {
          const coords = restaurant.location.coordinates!;
          const isSelected = selectedRestaurant?.id === restaurant.id;

          return (
            <Marker
              key={restaurant.id}
              position={[coords.lat, coords.lng]}
              icon={createCustomIcon(restaurant.rating, isSelected)}
              eventHandlers={{
                click: () => onRestaurantSelect(restaurant),
              }}
            >
              <Popup className="custom-popup">
                <div className="min-w-[180px]">
                  <div className="mb-1 text-base font-semibold text-gray-900">
                    {restaurant.name}
                  </div>
                  <div className="mb-1 text-sm text-gray-800">
                    {restaurant.location.neighborhood}
                  </div>
                  <div className="text-sm text-gray-800">{restaurant.cuisine.join(', ')}</div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-gray-800">{restaurant.priceRange}</span>
                    <span className="text-gray-800">•</span>
                    <span
                      className="font-semibold"
                      style={{ color: getRatingColor(restaurant.rating) }}
                    >
                      {restaurant.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
