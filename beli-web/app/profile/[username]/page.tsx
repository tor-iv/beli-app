import { MockDataService } from '@/lib/mockDataService';
import { notFound } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

export default async function ProfilePage({ params }: { params: { username: string } }) {
  // For now, just get current user
  // In a real app, you'd fetch by username
  const user = await MockDataService.getCurrentUser();

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-start gap-6 mb-8">
        <Avatar className="w-24 h-24">
          <AvatarImage src={user.avatar} alt={user.displayName} />
          <AvatarFallback>{user.displayName[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.displayName}</h1>
          <p className="text-muted">@{user.username}</p>
          {user.bio && <p className="mt-2">{user.bio}</p>}

          <div className="flex gap-6 mt-4">
            <div>
              <div className="text-xl font-bold">{user.stats.followers}</div>
              <div className="text-sm text-muted">Followers</div>
            </div>
            <div>
              <div className="text-xl font-bold">{user.stats.following}</div>
              <div className="text-sm text-muted">Following</div>
            </div>
            <div>
              <div className="text-xl font-bold">{user.stats.beenCount}</div>
              <div className="text-sm text-muted">Been</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="beli-card">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">#{user.stats.rank}</div>
            <div className="text-sm text-muted mt-1">Rank</div>
          </CardContent>
        </Card>

        <Card className="beli-card">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-streak">{user.stats.currentStreak}</div>
            <div className="text-sm text-muted mt-1">Day Streak</div>
          </CardContent>
        </Card>

        <Card className="beli-card">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold">{user.stats.totalReviews || 0}</div>
            <div className="text-sm text-muted mt-1">Reviews</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
