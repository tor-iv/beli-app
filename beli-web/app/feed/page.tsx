import { MockDataService } from '@/lib/mockDataService';
import { ActivityCard } from '@/components/social/activity-card';
import { TrendingWidget } from '@/components/feed/trending-widget';
import { RestaurantToggleWidget } from '@/components/profile/restaurant-toggle-widget';
import { ThreeColumnLayout } from '@/components/layout/three-column';

export default async function FeedPage() {
  // Server-side data fetching
  const feed = await MockDataService.getActivityFeed();

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Mobile: Single column */}
      <div className="lg:hidden max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Feed</h1>
        <div className="space-y-4">
          {feed.map((item) => (
            <ActivityCard key={item.id} activity={item} />
          ))}
        </div>
      </div>

      {/* Desktop: Two column layout with sticky sidebar */}
      <div className="hidden lg:block">
        <ThreeColumnLayout
          left={
            <div className="space-y-4">
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
  );
}
