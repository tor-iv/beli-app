import { MockDataService } from '@/lib/mockDataService';
import { notFound } from 'next/navigation';
import { RestaurantHeader } from '@/components/restaurant/restaurant-header';
import { RestaurantMetadata } from '@/components/restaurant/restaurant-metadata';
import { PopularDishes } from '@/components/restaurant/popular-dishes';
import { RatingBubble } from '@/components/rating/rating-bubble';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SidebarLayout } from '@/components/layout/sidebar';

export default async function RestaurantPage({ params }: { params: { id: string } }) {
  const restaurant = await MockDataService.getRestaurantById(params.id);

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Mobile: Single column */}
      <div className="md:hidden max-w-4xl mx-auto">
        <RestaurantHeader restaurant={restaurant} />

        <div className="space-y-6 mt-6">
          <RestaurantMetadata restaurant={restaurant} />
          <PopularDishes dishes={restaurant.popularDishes} />

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

      {/* Desktop: Sidebar layout */}
      <div className="hidden md:block max-w-7xl mx-auto">
        <RestaurantHeader restaurant={restaurant} />

        <div className="mt-6">
          <SidebarLayout
            sidebarSticky
            main={
              <div className="space-y-6">
                <RestaurantMetadata restaurant={restaurant} />
                <PopularDishes dishes={restaurant.popularDishes} />

                {/* Reviews section placeholder */}
                <Card className="beli-card">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Recent Reviews</h3>
                    <p className="text-muted text-sm">No reviews yet. Be the first to review!</p>
                  </CardContent>
                </Card>
              </div>
            }
            sidebar={
              <div className="space-y-4">
                {/* Rating card */}
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

                {/* Scores */}
                {restaurant.scores && (
                  <>
                    {restaurant.scores.recScore !== undefined && (
                      <Card className="beli-card">
                        <CardContent className="p-6 text-center">
                          <h3 className="font-semibold mb-2">Rec Score</h3>
                          <div className="text-3xl font-bold text-primary">
                            {restaurant.scores.recScore.toFixed(1)}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {restaurant.scores.friendScore !== undefined && (
                      <Card className="beli-card">
                        <CardContent className="p-6 text-center">
                          <h3 className="font-semibold mb-2">Friends</h3>
                          <div className="text-3xl font-bold text-primary">
                            {restaurant.scores.friendScore}
                          </div>
                          <p className="text-xs text-muted mt-1">friends been here</p>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                {/* Tags */}
                {restaurant.tags && restaurant.tags.length > 0 && (
                  <Card className="beli-card">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {restaurant.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Similar restaurants placeholder */}
                <Card className="beli-card">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">Similar Restaurants</h3>
                    <p className="text-sm text-muted">Discover more like this...</p>
                  </CardContent>
                </Card>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
