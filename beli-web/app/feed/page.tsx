import { MockDataService } from '@/lib/mockDataService';
import { ActivityCard } from '@/components/social/activity-card';
import { ThreeColumnLayout } from '@/components/layout/three-column';
import { TrendingWidget } from '@/components/feed/trending-widget';
import { LeaderboardWidget } from '@/components/feed/leaderboard-widget';
import { QuickStats } from '@/components/feed/quick-stats';

export default async function FeedPage() {
  // Server-side data fetching
  const feed = await MockDataService.getActivityFeed();
  const currentUser = await MockDataService.getCurrentUser();
  const leaderboard = await MockDataService.getLeaderboard();

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

      {/* Desktop: Three column layout */}
      <div className="hidden lg:block">
        <ThreeColumnLayout
          left={
            <div className="space-y-4">
              <QuickStats
                beenCount={currentUser.stats.beenCount}
                wantToTryCount={currentUser.stats.wantToTryCount}
                currentStreak={currentUser.stats.currentStreak}
                rank={currentUser.stats.rank}
              />
              <TrendingWidget />
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
          right={
            <div className="space-y-4">
              <LeaderboardWidget users={leaderboard.slice(0, 3).map(u => ({
                id: u.id,
                username: u.username,
                displayName: u.displayName,
                avatar: u.avatar,
                beenCount: u.stats.beenCount,
                rank: u.stats.rank
              }))} />
            </div>
          }
        />
      </div>
    </div>
  );
}
