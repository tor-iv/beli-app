import { MockDataService } from '@/lib/mockDataService';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default async function LeaderboardPage() {
  const users = await MockDataService.getLeaderboard();

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>

      <div className="space-y-2">
        {users.map((user, index) => (
          <Card key={user.id} className="beli-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="text-3xl font-bold text-primary w-12 text-center">
                #{index + 1}
              </div>

              <Avatar className="w-12 h-12">
                <AvatarImage src={user.avatar} alt={user.displayName} />
                <AvatarFallback>{user.displayName[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <Link
                  href={`/profile/${user.username}`}
                  className="font-semibold hover:underline"
                >
                  {user.displayName}
                </Link>
                <p className="text-sm text-muted">
                  {user.stats.beenCount} restaurants visited
                </p>
              </div>

              <div className="text-right">
                <div className="text-lg font-semibold">{user.stats.currentStreak}</div>
                <div className="text-xs text-muted">day streak</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
