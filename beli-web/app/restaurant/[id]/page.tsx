import { MockDataService } from '@/lib/mockDataService';
import { notFound } from 'next/navigation';
import { RestaurantHeader } from '@/components/restaurant/restaurant-header';
import { RestaurantMetadata } from '@/components/restaurant/restaurant-metadata';
import { PopularDishes } from '@/components/restaurant/popular-dishes';
import { RatingBubble } from '@/components/rating/rating-bubble';
import { Card, CardContent } from '@/components/ui/card';

export default async function RestaurantPage({ params }: { params: { id: string } }) {
  const restaurant = await MockDataService.getRestaurantById(params.id);

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <RestaurantHeader restaurant={restaurant} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2 space-y-6">
          <RestaurantMetadata restaurant={restaurant} />
          <PopularDishes dishes={restaurant.popularDishes} />
        </div>

        <div className="space-y-4">
          <Card className="beli-card">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 text-center">Overall Rating</h3>
              <div className="flex justify-center mb-4">
                <RatingBubble rating={restaurant.rating} size="lg" />
              </div>
              {restaurant.ratingCount && (
                <p className="text-center text-sm text-muted">
                  Based on {restaurant.ratingCount} reviews
                </p>
              )}
            </CardContent>
          </Card>

          {restaurant.scores?.recScore !== undefined && (
            <Card className="beli-card">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Rec Score</h3>
                <div className="text-3xl font-bold text-primary">
                  {restaurant.scores.recScore.toFixed(1)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
