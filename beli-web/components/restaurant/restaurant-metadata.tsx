import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { Restaurant } from '@/types';

interface RestaurantMetadataProps {
  restaurant: Restaurant;
}

export const RestaurantMetadata = ({ restaurant }: RestaurantMetadataProps) => {
  return (
    <Card className="beli-card mb-6">
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="mb-1 text-sm text-muted">Address</div>
          <div className="font-medium">
            {restaurant.location.address}
            {restaurant.location.city && `, ${restaurant.location.city}`}
          </div>
        </div>

        {restaurant.phone && (
          <div>
            <div className="mb-1 text-sm text-muted">Phone</div>
            <div className="font-medium">{restaurant.phone}</div>
          </div>
        )}

        {restaurant.website && (
          <div>
            <div className="mb-1 text-sm text-muted">Website</div>
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
      </CardContent>
    </Card>
  );
}
