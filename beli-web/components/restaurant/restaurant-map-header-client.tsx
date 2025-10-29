'use client';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { Restaurant } from '@/types';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// Get color based on rating (matching native color system)
function getRatingColor(rating: number): string {
  if (rating >= 8.5) return '#22C55E'; // Excellent (green)
  if (rating >= 7.0) return '#84CC16';  // Good (light green)
  if (rating >= 5.0) return '#F97316';  // Average (orange)
  return '#EF4444';                     // Poor (red)
}

// Custom marker icon matching rating color
function createCustomIcon(rating: number): L.DivIcon {
  const color = getRatingColor(rating);
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background-color: white;
        border: 3px solid ${color};
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        color: ${color};
        font-size: 16px;
      ">
        ${rating.toFixed(1)}
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

interface RestaurantMapHeaderClientProps {
  restaurant: Restaurant;
}

export default function RestaurantMapHeaderClient({ restaurant }: RestaurantMapHeaderClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Parallax effect: map moves slower than scroll
  const y = useTransform(scrollY, [0, 300], [0, 50]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0.3]);

  if (!restaurant.location?.coordinates) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <p className="text-muted-foreground">Map location unavailable</p>
      </div>
    );
  }

  const { lat, lng } = restaurant.location.coordinates;

  return (
    <motion.div
      ref={containerRef}
      className="relative z-0 w-full h-full"
      style={{ y, opacity }}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        className="w-full h-full"
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        <Marker
          position={[lat, lng]}
          icon={createCustomIcon(restaurant.rating)}
        />
      </MapContainer>
    </motion.div>
  );
}
