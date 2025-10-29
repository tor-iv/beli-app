import { Restaurant } from '@/types';
import { MapPin, Phone, Globe, Clock } from 'lucide-react';

interface RestaurantMetadataInlineProps {
  restaurant: Restaurant;
}

export function RestaurantMetadataInline({ restaurant }: RestaurantMetadataInlineProps) {
  const getCurrentDayHours = () => {
    if (!restaurant.hours) return null;
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    const today = days[new Date().getDay()];
    return restaurant.hours[today];
  };

  const todayHours = getCurrentDayHours();

  return (
    <div className="space-y-3 py-4 border-b border-gray-200">
      {/* Address */}
      <div className="flex items-start gap-3">
        <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-medium">
            {restaurant.location.address}
          </div>
          <div className="text-sm text-muted-foreground">
            {restaurant.location.city}, {restaurant.location.state}
          </div>
        </div>
      </div>

      {/* Phone */}
      {restaurant.phone && (
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <a
            href={`tel:${restaurant.phone}`}
            className="font-medium text-primary hover:underline"
          >
            {restaurant.phone}
          </a>
        </div>
      )}

      {/* Website */}
      {restaurant.website && (
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <a
            href={restaurant.website}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            Visit website
          </a>
        </div>
      )}

      {/* Hours */}
      {todayHours && (
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div>
            <span className="font-medium">Today: </span>
            <span className="text-muted-foreground">{todayHours}</span>
          </div>
        </div>
      )}
    </div>
  );
}
