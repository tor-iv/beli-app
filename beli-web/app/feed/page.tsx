"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Utensils } from "lucide-react"
import { MockDataService } from "@/lib/mockDataService"
import { ActivityCard } from "@/components/social/activity-card"
import { TrendingWidget } from "@/components/feed/trending-widget"
import { RestaurantToggleWidget } from "@/components/profile/restaurant-toggle-widget"
import { ThreeColumnLayout } from "@/components/layout/three-column"
import { TastemakerPicksWidget } from "@/components/feed/tastemaker-picks-widget"
import { MobileFeedHeader } from "@/components/navigation/mobile-feed-header"
import { ActionButtons } from "@/components/feed/action-buttons"
import { FeaturedListsSection } from "@/components/feed/featured-lists-section"
import { TastemakerPostsSection } from "@/components/feed/tastemaker-posts-section"
import { ContentModeSelector, type ContentMode } from "@/components/feed/content-mode-selector"
import { FeedFiltersModal, type FeedFilters } from "@/components/modals/feed-filters-modal"
import { getFeaturedPosts } from "@/data/mock/tastemakerPosts"
import type { FeedItem, List } from "@/types"

export default function FeedPage() {
  const router = useRouter()
  const [feed, setFeed] = React.useState<FeedItem[]>([])
  const [featuredLists, setFeaturedLists] = React.useState<List[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showFiltersModal, setShowFiltersModal] = React.useState(false)
  const [contentMode, setContentMode] = React.useState<ContentMode>('featured-lists')
  const [filters, setFilters] = React.useState<FeedFilters>({
    rankingsOnly: false,
    topRatedOnly: false,
    restaurantsOnly: false,
  })

  const featuredPosts = getFeaturedPosts()

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [feedData, listsData] = await Promise.all([
          MockDataService.getActivityFeed(),
          MockDataService.getFeaturedLists(),
        ])
        setFeed(feedData)
        setFeaturedLists(listsData)
      } catch (error) {
        console.error("Failed to load feed data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Apply filters to feed
  const filteredFeed = React.useMemo(() => {
    return feed.filter((item) => {
      // Rankings only filter
      if (filters.rankingsOnly && item.type !== "review") {
        return false
      }
      // Top rated only filter
      if (filters.topRatedOnly && item.type === "review") {
        const rating = item.details?.rating
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

  const handleApplyFilters = (newFilters: FeedFilters) => {
    setFilters(newFilters)
  }

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
        unreadNotificationCount={2}
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

      {/* Mobile: Content Mode Selector and Content Sections */}
      <div className="md:hidden px-4 mb-4">
        <ContentModeSelector mode={contentMode} onModeChange={setContentMode} />
      </div>

      {contentMode === 'featured-lists' ? (
        <FeaturedListsSection
          lists={featuredLists}
          onSeeAllClick={() => router.push("/lists/featured")}
        />
      ) : (
        <div className="md:hidden px-4">
          <TastemakerPostsSection posts={featuredPosts} />
        </div>
      )}

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
          {/* Tastemaker Picks Widget - Mobile Only */}
          {featuredPosts.length > 0 && (
            <div className="mb-6">
              <TastemakerPicksWidget
                featuredPost={featuredPosts[0]}
                recentPosts={featuredPosts.slice(1, 3)}
              />
            </div>
          )}

          <div className="space-y-4">
            {filteredFeed.map((item) => (
              <ActivityCard key={item.id} activity={item} />
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

                <TrendingWidget />
                <RestaurantToggleWidget defaultView="reserve" />
              </div>
            }
            center={
              <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Your Feed</h1>
                <div className="space-y-4">
                  {feed.map((item) => (
                    <ActivityCard key={item.id} activity={item} />
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
    </div>
  )
}
