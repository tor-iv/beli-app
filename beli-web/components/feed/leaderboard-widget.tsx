'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { IoTrophy } from 'react-icons/io5';

interface LeaderboardUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  beenCount: number;
  rank: number;
}

interface LeaderboardWidgetProps {
  users?: LeaderboardUser[];
}

export function LeaderboardWidget({ users }: LeaderboardWidgetProps) {
  const defaultUsers: LeaderboardUser[] = users || [
    {
      id: '1',
      username: 'foodie_alex',
      displayName: 'Alex Chen',
      avatar: '/avatars/alex.jpg',
      beenCount: 156,
      rank: 1,
    },
    {
      id: '2',
      username: 'sarah_eats',
      displayName: 'Sarah Kim',
      avatar: '/avatars/sarah.jpg',
      beenCount: 142,
      rank: 2,
    },
    {
      id: '3',
      username: 'mike_tastes',
      displayName: 'Mike Torres',
      avatar: '/avatars/mike.jpg',
      beenCount: 138,
      rank: 3,
    },
  ];

  return (
    <Card className="beli-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Leaderboard</h3>
          <Link href="/leaderboard" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {defaultUsers.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.username}`}
              className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors -mx-2"
            >
              <div className="text-lg font-bold text-primary w-6">#{user.rank}</div>
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar} alt={user.displayName} />
                <AvatarFallback>{user.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{user.displayName}</div>
                <div className="text-xs text-muted">{user.beenCount} restaurants</div>
              </div>
              {user.rank === 1 && <IoTrophy className="w-5 h-5 text-yellow-500" />}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
