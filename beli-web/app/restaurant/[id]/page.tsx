'use client';

import { MockDataService } from '@/lib/mockDataService';
import { notFound, useParams } from 'next/navigation';
import { RestaurantMapHeader } from '@/components/restaurant/restaurant-map-header';
import { RestaurantNavOverlay } from '@/components/restaurant/restaurant-nav-overlay';
import { RestaurantHeader } from '@/components/restaurant/restaurant-header';
import { RestaurantMetadataInline } from '@/components/restaurant/restaurant-metadata-inline';
import { RestaurantActionButtons } from '@/components/restaurant/restaurant-action-buttons';
import { RestaurantTagsList } from '@/components/restaurant/restaurant-tags-list';
import { RestaurantSocialProof } from '@/components/restaurant/restaurant-social-proof';
import { PopularDishGallery } from '@/components/restaurant/popular-dish-gallery';
import { RestaurantScoreCard } from '@/components/restaurant/restaurant-score-card';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WhatToOrderModal } from '@/components/modals/what-to-order-modal';
import { AddRestaurantModal } from '@/components/modals/add-restaurant-modal';
import { RestaurantPageSkeleton } from '@/components/restaurant/restaurant-page-skeleton';
import { useState, useEffect } from 'react';
import { Restaurant } from '@/types';

export default function RestaurantPage() {
  const params = useParams();
  const id = params?.id as string;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWhatToOrder, setShowWhatToOrder] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      setIsLoading(true);
      const data = await MockDataService.getRestaurantById(id);
      setRestaurant(data);
      setIsLoading(false);
    };
    fetchRestaurant();
  }, [id]);

  if (isLoading || !restaurant) {
    return <RestaurantPageSkeleton />;
  }

  const handleAddSubmit = (data: any) => {
    console.log('Restaurant added:', data);
    setShowAddModal(false);
    // In real app, would call API
  };

  return (
    <>
      {/* Map Header with Parallax */}
      <div className="relative">
        <RestaurantMapHeader restaurant={restaurant} />

        {/* Navigation Overlay */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4">
          <RestaurantNavOverlay restaurant={restaurant} />
        </div>
      </div>

      {/* Main Content Card with Overlap */}
      <div className="relative -mt-16 z-10">
        <Card className="rounded-t-3xl shadow-xl border-0">
          <CardContent className="p-0">
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
              {/* Restaurant Header with Actions */}
              <RestaurantHeader
                restaurant={restaurant}
                onBookmark={() => console.log('Bookmarked')}
                onAddToList={() => setShowAddModal(true)}
              />

              {/* Tags List */}
              {restaurant.tags && restaurant.tags.length > 0 && (
                <RestaurantTagsList tags={restaurant.tags} />
              )}

              {/* Inline Metadata */}
              <RestaurantMetadataInline restaurant={restaurant} />

              {/* Social Proof */}
              <RestaurantSocialProof restaurant={restaurant} />

              {/* Action Buttons Grid */}
              <div className="my-6">
                <RestaurantActionButtons
                  restaurant={restaurant}
                  onWhatToOrder={() => setShowWhatToOrder(true)}
                />
              </div>

              {/* Scores Section */}
              {restaurant.scores && (
                <div className="my-6">
                  {/* Section Header with SC Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">Scores</h3>
                      <Badge className="bg-primary text-white text-xs px-2 py-0.5">SC</Badge>
                    </div>
                    <button className="text-sm text-primary hover:underline">
                      See all scores
                    </button>
                  </div>

                  {/* Horizontal Scrolling Score Cards */}
                  <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                    {restaurant.scores.recScore !== undefined && (
                      <RestaurantScoreCard
                        title="Rec Score"
                        description="How much we think you will like it"
                        score={restaurant.scores.recScore}
                        sampleSize={restaurant.scores.recScoreSampleSize}
                        variant="rec"
                      />
                    )}
                    {restaurant.scores.friendScore !== undefined && (
                      <RestaurantScoreCard
                        title="Friend Score"
                        description="What your friends think"
                        score={restaurant.scores.friendScore}
                        sampleSize={restaurant.scores.friendScoreSampleSize}
                        variant="friend"
                      />
                    )}
                    {restaurant.scores.averageScore !== undefined && (
                      <RestaurantScoreCard
                        title="Average Score"
                        description="Community average"
                        score={restaurant.scores.averageScore}
                        sampleSize={restaurant.scores.averageScoreSampleSize}
                        variant="average"
                      />
                    )}
                  </div>

                  <style jsx global>{`
                    .scrollbar-hide {
                      -ms-overflow-style: none;
                      scrollbar-width: none;
                    }
                    .scrollbar-hide::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                </div>
              )}

              {/* Popular Dishes Gallery */}
              <PopularDishGallery restaurant={restaurant} />

              {/* Reviews Placeholder */}
              <Card className="beli-card my-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Recent Reviews</h3>
                  <p className="text-muted-foreground text-sm">
                    No reviews yet. Be the first to review!
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <WhatToOrderModal
        open={showWhatToOrder}
        onOpenChange={setShowWhatToOrder}
        restaurant={restaurant}
      />

      <AddRestaurantModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        restaurant={restaurant}
        onSubmit={handleAddSubmit}
      />
    </>
  );
}
