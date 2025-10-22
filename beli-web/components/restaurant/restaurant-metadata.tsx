import { Restaurant } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RestaurantMetadataProps {
  restaurant: Restaurant;
}

export function RestaurantMetadata({ restaurant }: RestaurantMetadataProps) {
  return (
    <Card className="beli-card mb-6">
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-sm text-muted mb-1">Address</div>
          <div className="font-medium">
            {restaurant.location.address}
            {restaurant.location.city && `, ${restaurant.location.city}`}
          </div>
        </div>

        {restaurant.phone && (
          <div>
            <div className="text-sm text-muted mb-1">Phone</div>
            <div className="font-medium">{restaurant.phone}</div>
          </div>
        )}

        {restaurant.website && (
          <div>
            <div className="text-sm text-muted mb-1">Website</div>
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
