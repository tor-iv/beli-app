import { MockDataService } from '@/lib/mockDataService';
import { ActivityCard } from '@/components/social/activity-card';

export default async function FeedPage() {
  // Server-side data fetching
  const feed = await MockDataService.getActivityFeed();

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Your Feed</h1>

      <div className="space-y-4">
        {feed.map((item) => (
          <ActivityCard key={item.id} activity={item} />
        ))}
      </div>
    </div>
  );
}
