'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { ActionButtons } from '@/components/feed/action-buttons';
import { DesktopFeedSidebar } from '@/components/feed/DesktopFeedSidebar';
import { FeaturedListsSection } from '@/components/feed/featured-lists-section';
import { ThreeColumnLayout } from '@/components/layout/three-column';
import { AddRestaurantModal } from '@/components/modals/add-restaurant-modal';
import { CommentsModal } from '@/components/modals/comments-modal';
import { FeedFiltersModal, type FeedFilters } from '@/components/modals/feed-filters-modal';
import { RankingResultModal } from '@/components/modals/ranking-result-modal';
import { ShareModal } from '@/components/modals/share-modal';
import { MobileFeedHeader } from '@/components/navigation/mobile-feed-header';
import { ActivityCard } from '@/components/social/activity-card';
import { useUnreadNotificationCount, useFeed, useFeaturedLists, useCurrentUser } from '@/lib/hooks';
import { useFeedFilters } from '@/lib/hooks/use-feed-filters';
import { useFeedModals } from '@/lib/hooks/use-feed-modals';

/**
 * Feed page - Social activity feed with restaurant discoveries
 * Displays activity from followed users, with filtering and interaction capabilities
 * Refactored for reduced complexity and better separation of concerns
 */

export default function FeedPage() {
  const router = useRouter();

  // React Query hooks for data fetching
  const { data: feed = [], isLoading: feedLoading } = useFeed();
  const { data: featuredLists = [], isLoading: listsLoading } = useFeaturedLists();
  const { data: currentUser } = useCurrentUser();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  // Modal state and handlers (extracted to custom hook)
  const { modalState, setModalState, handlers } = useFeedModals(currentUser, feed);

  // Filter state
  const [showFiltersModal, setShowFiltersModal] = React.useState(false);
  const [filters, setFilters] = React.useState<FeedFilters>({
    rankingsOnly: false,
    topRatedOnly: false,
    restaurantsOnly: false,
  });

  const loading = feedLoading || listsLoading;

  // Apply filters to feed (extracted to custom hook)
  const filteredFeed = useFeedFilters(feed, filters);

  const handleApplyFilters = React.useCallback((newFilters: FeedFilters) => {
    setFilters(newFilters);
  }, []);

  const hasActiveFilters = filters.rankingsOnly || filters.topRatedOnly || filters.restaurantsOnly;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p>Loading feed...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Mobile Feed Header */}
      <MobileFeedHeader
        unreadNotificationCount={unreadCount}
        onNotificationsClick={() => router.push('/notifications')}
        onReservationsClick={() => router.push('/reservations')}
        onGroupDinnerClick={() => router.push('/group-dinner')}
        onSearchClick={() => router.push('/search')}
      />

      {/* Mobile: Action Buttons */}
      <ActionButtons
        onReserveClick={() => router.push('/lists?view=reserve')}
        onRecsNearbyClick={() => router.push('/lists?view=nearby')}
        onTrendingClick={() => router.push('/lists?view=trending')}
        onFriendRecsClick={() => router.push('/lists?view=friends')}
      />

      {/* Mobile: Tastemakers Section */}
      <FeaturedListsSection
        lists={featuredLists}
        onSeeAllClick={() => router.push('/tastemakers')}
      />

      {/* Mobile: Feed Filters */}
      <div className="flex items-center gap-2 px-4 pb-3 md:hidden">
        <button
          onClick={() => setShowFiltersModal(true)}
          className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-button transition-colors hover:bg-gray-50"
        >
          <span className="text-sm font-medium">Filters</span>
          <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
            SC
          </span>
          {hasActiveFilters && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs text-white">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Mobile: Single column */}
        <div className="mx-auto max-w-2xl lg:hidden">
          <div className="space-y-4">
            {filteredFeed.map((item) => (
              <ActivityCard
                key={item.id}
                activity={item}
                currentUserId={currentUser?.id}
                onLike={() => handlers.handleLike(item.id)}
                onComment={() => handlers.handleComment(item)}
                onShare={() => handlers.handleShare(item)}
                onBookmark={() => handlers.handleBookmark(item.id)}
                onAddPress={() => handlers.handleAddPress(item.restaurant)}
              />
            ))}
          </div>
        </div>

        {/* Desktop: Two column layout with sticky sidebar */}
        <div className="hidden lg:block">
          <ThreeColumnLayout
            left={<DesktopFeedSidebar />}
            center={
              <div className="mx-auto max-w-2xl">
                <h1 className="mb-6 text-2xl font-bold">Your Feed</h1>
                <div className="space-y-4">
                  {filteredFeed.map((item) => (
                    <ActivityCard
                      key={item.id}
                      activity={item}
                      currentUserId={currentUser?.id}
                      onLike={() => handlers.handleLike(item.id)}
                      onComment={() => handlers.handleComment(item)}
                      onShare={() => handlers.handleShare(item)}
                      onBookmark={() => handlers.handleBookmark(item.id)}
                      onAddPress={() => handlers.handleAddPress(item.restaurant)}
                    />
                  ))}
                </div>
              </div>
            }
            stickySidebars={true}
            className="gap-12"
          />
        </div>
      </div>

      {/* Feed Filters Modal */}
      <FeedFiltersModal
        open={showFiltersModal}
        filters={filters}
        onClose={() => setShowFiltersModal(false)}
        onApply={handleApplyFilters}
      />

      {/* Comments Modal */}
      {modalState.type === 'comments' && (
        <CommentsModal
          open={true}
          onOpenChange={(open) => !open && setModalState({ type: null })}
          activity={modalState.activity}
          currentUser={currentUser || undefined}
          onAddComment={handlers.handleAddComment}
        />
      )}

      {/* Share Modal */}
      {modalState.type === 'share' && (
        <ShareModal
          open={true}
          onOpenChange={(open) => !open && setModalState({ type: null })}
          restaurant={modalState.activity.restaurant}
          user={modalState.activity.user}
        />
      )}

      {/* Add Restaurant Modal */}
      {modalState.type === 'add' && currentUser && (
        <AddRestaurantModal
          open={true}
          onOpenChange={(open) => !open && setModalState({ type: null })}
          restaurant={modalState.restaurant}
          userId={currentUser.id}
          onRankingComplete={handlers.handleRankingComplete}
        />
      )}

      {/* Ranking Result Modal */}
      {modalState.type === 'result' && currentUser && (
        <RankingResultModal
          open={true}
          onOpenChange={(open) => !open && setModalState({ type: null })}
          restaurant={modalState.restaurant}
          user={currentUser}
          result={modalState.result}
          notes={modalState.data.notes}
          photos={modalState.data.photos}
          visitCount={1}
          onDone={handlers.handleResultDone}
        />
      )}
    </div>
  );
}
