"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Utensils } from "lucide-react"
import { ActivityCard } from "@/components/social/activity-card"
import { RestaurantToggleWidget } from "@/components/profile/restaurant-toggle-widget"
import { ThreeColumnLayout } from "@/components/layout/three-column"
import { MobileFeedHeader } from "@/components/navigation/mobile-feed-header"
import { ActionButtons } from "@/components/feed/action-buttons"
import { FeaturedListsSection } from "@/components/feed/featured-lists-section"
import { FeedFiltersModal, type FeedFilters } from "@/components/modals/feed-filters-modal"
import { CommentsModal } from "@/components/modals/comments-modal"
import { ShareModal } from "@/components/modals/share-modal"
import { AddRestaurantModal } from "@/components/modals/add-restaurant-modal"
import { RankingResultModal } from "@/components/modals/ranking-result-modal"
import {
  useAddRankedRestaurant,
  useUnreadNotificationCount,
  useFeed,
  useFeaturedLists,
  useCurrentUser,
  useLikeActivity,
  useBookmarkActivity,
  useAddComment
} from "@/lib/hooks"
import type { Activity, Restaurant, RankingResult } from "@/types"
import type { RestaurantSubmissionData } from "@/components/modals/add-restaurant-modal"

// Modal state type for managing all modals
type ModalState =
  | { type: 'comments'; activity: Activity }
  | { type: 'share'; activity: Activity }
  | { type: 'add'; restaurant: Restaurant }
  | { type: 'result'; restaurant: Restaurant; result: RankingResult; data: RestaurantSubmissionData }
  | { type: null }

export default function FeedPage() {
  const router = useRouter()

  // React Query hooks for data fetching
  const { data: feed = [], isLoading: feedLoading } = useFeed()
  const { data: featuredLists = [], isLoading: listsLoading } = useFeaturedLists()
  const { data: currentUser } = useCurrentUser()
  const { data: unreadCount = 0 } = useUnreadNotificationCount()

  // React Query mutation hooks
  const addRankedRestaurantMutation = useAddRankedRestaurant()
  const likeMutation = useLikeActivity()
  const bookmarkMutation = useBookmarkActivity()
  const addCommentMutation = useAddComment()

  // Combined modal state (reduces from 8 state variables to 1)
  const [modalState, setModalState] = React.useState<ModalState>({ type: null })

  // Filter state
  const [showFiltersModal, setShowFiltersModal] = React.useState(false)
  const [filters, setFilters] = React.useState<FeedFilters>({
    rankingsOnly: false,
    topRatedOnly: false,
    restaurantsOnly: false,
  })

  const loading = feedLoading || listsLoading

  // Interaction handlers with useCallback for performance
  const handleLike = React.useCallback((activityId: string) => {
    if (!currentUser) return

    // Find current like status
    const activity = feed.find(a => a.id === activityId)
    const isLiked = activity?.interactions?.likes.includes(currentUser.id) || false

    // Trigger mutation with optimistic update
    likeMutation.mutate({ activityId, userId: currentUser.id, isLiked })
  }, [currentUser, feed, likeMutation])

  const handleComment = React.useCallback((activity: Activity) => {
    setModalState({ type: 'comments', activity })
  }, [])

  const handleShare = React.useCallback((activity: Activity) => {
    setModalState({ type: 'share', activity })
  }, [])

  const handleBookmark = React.useCallback((activityId: string) => {
    if (!currentUser) return

    // Find current bookmark status
    const activity = feed.find(a => a.id === activityId)
    const isBookmarked = activity?.interactions?.bookmarks.includes(currentUser.id) || false

    // Trigger mutation with optimistic update
    bookmarkMutation.mutate({ activityId, userId: currentUser.id, isBookmarked })
  }, [currentUser, feed, bookmarkMutation])

  const handleAddPress = React.useCallback((restaurant: Restaurant) => {
    setModalState({ type: 'add', restaurant })
  }, [])

  const handleRankingComplete = React.useCallback(async (result: RankingResult, data: RestaurantSubmissionData) => {
    if (!currentUser || modalState.type !== 'add') return

    const restaurant = modalState.restaurant

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
      })

      // Show result modal
      setModalState({ type: 'result', restaurant, result, data })
    } catch (error) {
      console.error('Error saving ranking:', error)
    }
  }, [currentUser, modalState, addRankedRestaurantMutation])

  const handleResultDone = React.useCallback(() => {
    setModalState({ type: null })
  }, [])

  const handleAddComment = React.useCallback((content: string) => {
    if (modalState.type !== 'comments' || !currentUser) return

    const activityId = modalState.activity.id

    // Trigger mutation with optimistic update
    addCommentMutation.mutate({
      activityId,
      userId: currentUser.id,
      content
    })
  }, [modalState, currentUser, addCommentMutation])

  // Apply filters to feed
  const filteredFeed = React.useMemo(() => {
    return feed.filter((item) => {
      // Rankings only filter
      if (filters.rankingsOnly && item.type !== "review") {
        return false
      }
      // Top rated only filter
      if (filters.topRatedOnly && item.type === "review") {
        const rating = item.rating
        if (!rating || rating < 9.0) {
          return false
        }
      }
      // Restaurants only filter
      if (filters.restaurantsOnly && item.type === "review") {
        // TODO: Check if restaurant is actually a restaurant (not bar/bakery)
        // For now, we'll keep all reviews
      }
      return true
    })
  }, [feed, filters])

  const handleApplyFilters = React.useCallback((newFilters: FeedFilters) => {
    setFilters(newFilters)
  }, [])

  const hasActiveFilters =
    filters.rankingsOnly || filters.topRatedOnly || filters.restaurantsOnly

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p>Loading feed...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Mobile Feed Header */}
      <MobileFeedHeader
        unreadNotificationCount={unreadCount}
        onNotificationsClick={() => router.push("/notifications")}
        onReservationsClick={() => router.push("/reservations")}
        onGroupDinnerClick={() => router.push("/group-dinner")}
        onSearchClick={() => router.push("/search")}
      />

      {/* Mobile: Action Buttons */}
      <ActionButtons
        onReserveClick={() => router.push("/lists?view=reserve")}
        onRecsNearbyClick={() => router.push("/lists?view=nearby")}
        onTrendingClick={() => router.push("/lists?view=trending")}
        onFriendRecsClick={() => router.push("/lists?view=friends")}
      />

      {/* Mobile: Tastemakers Section */}
      <FeaturedListsSection
        lists={featuredLists}
        onSeeAllClick={() => router.push("/tastemakers")}
      />

      {/* Mobile: Feed Filters */}
      <div className="md:hidden px-4 pb-3 flex items-center gap-2">
        <button
          onClick={() => setShowFiltersModal(true)}
          className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-button hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium">Filters</span>
          <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            SC
          </span>
          {hasActiveFilters && (
            <span className="bg-primary text-white text-xs rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Mobile: Single column */}
        <div className="lg:hidden max-w-2xl mx-auto">
          <div className="space-y-4">
            {filteredFeed.map((item) => (
              <ActivityCard
                key={item.id}
                activity={item}
                currentUserId={currentUser?.id}
                onLike={() => handleLike(item.id)}
                onComment={() => handleComment(item)}
                onShare={() => handleShare(item)}
                onBookmark={() => handleBookmark(item.id)}
                onAddPress={() => handleAddPress(item.restaurant)}
              />
            ))}
          </div>
        </div>

        {/* Desktop: Two column layout with sticky sidebar */}
        <div className="hidden lg:block">
          <ThreeColumnLayout
            left={
              <div className="space-y-4">
                {/* Eat Now Button */}
                <button
                  onClick={() => router.push("/group-dinner")}
                  className="w-full bg-white rounded-lg shadow-card p-4 hover:shadow-card-hover transition-all duration-200 flex items-center justify-center gap-3 group"
                  aria-label="Eat Now - Find restaurants for your group"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Utensils className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">Eat Now</span>
                </button>

                <RestaurantToggleWidget defaultView="reserve" />
              </div>
            }
            center={
              <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Your Feed</h1>
                <div className="space-y-4">
                  {filteredFeed.map((item) => (
                    <ActivityCard
                      key={item.id}
                      activity={item}
                      currentUserId={currentUser?.id}
                      onLike={() => handleLike(item.id)}
                      onComment={() => handleComment(item)}
                      onShare={() => handleShare(item)}
                      onBookmark={() => handleBookmark(item.id)}
                      onAddPress={() => handleAddPress(item.restaurant)}
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
          onAddComment={handleAddComment}
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
          onRankingComplete={handleRankingComplete}
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
          onDone={handleResultDone}
        />
      )}
    </div>
  )
}
