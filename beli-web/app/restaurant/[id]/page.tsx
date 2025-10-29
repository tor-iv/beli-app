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
import { RankingResultModal } from '@/components/modals/ranking-result-modal';
import { ReserveModal } from '@/components/modals/reserve-modal';
import { RestaurantPageSkeleton } from '@/components/restaurant/restaurant-page-skeleton';
import { useState, useEffect } from 'react';
import { useAddRankedRestaurant } from '@/lib/hooks';
import { Restaurant, User, RankingResult } from '@/types';
import type { RestaurantSubmissionData } from '@/components/modals/add-restaurant-modal';

export default function RestaurantPage() {
  const params = useParams();
  const id = params?.id as string;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWhatToOrder, setShowWhatToOrder] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);

  // Ranking state
  const [showResultModal, setShowResultModal] = useState(false);
  const [rankingResult, setRankingResult] = useState<RankingResult | null>(null);
  const [rankingData, setRankingData] = useState<RestaurantSubmissionData | null>(null);

  const addRankedRestaurantMutation = useAddRankedRestaurant();

  useEffect(() => {
    const fetchRestaurant = async () => {
      setIsLoading(true);
      const [restaurantData, userData] = await Promise.all([
        MockDataService.getRestaurantById(id),
        MockDataService.getCurrentUser(),
      ]);
      setRestaurant(restaurantData);
      setCurrentUser(userData);
      setIsLoading(false);
    };
    fetchRestaurant();
  }, [id]);

  if (isLoading || !restaurant || !currentUser) {
    return <RestaurantPageSkeleton />;
  }

  const handleRankingComplete = async (result: RankingResult, data: RestaurantSubmissionData) => {
    try {
      // Save to MockDataService
      await addRankedRestaurantMutation.mutateAsync({
        userId: currentUser.id,
        restaurantId: restaurant.id,
        result,
        data: {
          notes: data.notes || undefined,
          photos: data.photos && data.photos.length > 0 ? data.photos : undefined,
          tags: data.labels && data.labels.length > 0 ? data.labels : undefined,
          companions: data.companions && data.companions.length > 0 ? data.companions : undefined,
        },
      });

      // Store result for the result modal
      setRankingResult(result);
      setRankingData(data);

      // Close add modal and show result modal
      setShowAddModal(false);
      setShowResultModal(true);
    } catch (error) {
      console.error('Error saving ranking:', error);
    }
  };

  const handleResultDone = () => {
    setShowResultModal(false);
    setRankingResult(null);
    setRankingData(null);
  };

  return (
    <>
      {/* Map Header with Parallax */}
      <div className="relative z-0">
        <RestaurantMapHeader restaurant={restaurant} />
      </div>

      {/* Navigation Overlay - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-40 p-4 pointer-events-none">
        <div className="pointer-events-auto">
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
                  onReserve={() => setShowReserveModal(true)}
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
        userId={currentUser.id}
        onRankingComplete={handleRankingComplete}
      />

      <ReserveModal
        open={showReserveModal}
        onOpenChange={setShowReserveModal}
        restaurant={restaurant}
      />

      {/* Ranking Result Modal */}
      {rankingResult && (
        <RankingResultModal
          open={showResultModal}
          onOpenChange={setShowResultModal}
          restaurant={restaurant}
          user={currentUser}
          result={rankingResult}
          notes={rankingData?.notes}
          photos={rankingData?.photos}
          visitCount={1}
          onDone={handleResultDone}
        />
      )}
    </>
  );
}
