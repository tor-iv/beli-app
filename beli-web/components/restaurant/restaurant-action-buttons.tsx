'use client';

import { Utensils, Globe, Phone, Navigation, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { Restaurant } from '@/types';

interface RestaurantActionButtonsProps {
  restaurant: Restaurant;
  onWhatToOrder?: () => void;
  onReserve?: () => void;
}

export const RestaurantActionButtons = ({
  restaurant,
  onWhatToOrder,
  onReserve,
}: RestaurantActionButtonsProps) => {
  const hasMenu = restaurant.menu && restaurant.menu.length > 0;
  const hasWebsite = !!restaurant.website;
  const hasPhone = !!restaurant.phone;
  const hasLocation = !!restaurant.location?.coordinates;

  const handleWebsite = () => {
    if (restaurant.website) {
      window.open(restaurant.website, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCall = () => {
    if (restaurant.phone) {
      window.location.href = `tel:${restaurant.phone}`;
    }
  };

  const handleDirections = () => {
    if (restaurant.location?.coordinates) {
      const { lat, lng } = restaurant.location.coordinates;
      // Detect device and use appropriate maps app
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // Try Apple Maps first on iOS, Google Maps on Android
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isIOS) {
          window.location.href = `maps://maps.apple.com/?q=${lat},${lng}`;
        } else {
          window.location.href = `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(restaurant.name)})`;
        }
      } else {
        // Desktop: Open Google Maps in new tab
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
          '_blank',
          'noopener,noreferrer'
        );
      }
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Reserve Now */}
      <Button
        variant="outline"
        className="flex h-20 flex-col items-center justify-center gap-1"
        onClick={onReserve}
      >
        <Calendar className="h-5 w-5" />
        <span className="text-xs">Reserve Now</span>
      </Button>

      {/* What to Order */}
      <Button
        variant="outline"
        className="flex h-20 flex-col items-center justify-center gap-1"
        disabled={!hasMenu}
        onClick={onWhatToOrder}
      >
        <Utensils className="h-5 w-5" />
        <span className="text-xs">What to Order</span>
      </Button>

      {/* Website */}
      <Button
        variant="outline"
        className="flex h-20 flex-col items-center justify-center gap-1"
        disabled={!hasWebsite}
        onClick={handleWebsite}
      >
        <Globe className="h-5 w-5" />
        <span className="text-xs">Website</span>
      </Button>

      {/* Call */}
      <Button
        variant="outline"
        className="flex h-20 flex-col items-center justify-center gap-1"
        disabled={!hasPhone}
        onClick={handleCall}
      >
        <Phone className="h-5 w-5" />
        <span className="text-xs">Call</span>
      </Button>

      {/* Directions */}
      <Button
        variant="outline"
        className="flex h-20 flex-col items-center justify-center gap-1"
        disabled={!hasLocation}
        onClick={handleDirections}
      >
        <Navigation className="h-5 w-5" />
        <span className="text-xs">Directions</span>
      </Button>
    </div>
  );
}
