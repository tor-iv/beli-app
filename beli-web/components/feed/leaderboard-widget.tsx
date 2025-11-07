'use client';

import Link from 'next/link';
import { IoTrophy } from 'react-icons/io5';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

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

export const LeaderboardWidget = ({ users }: LeaderboardWidgetProps) => {
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
        <div className="mb-4 flex items-center justify-between">
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
              className="-mx-2 flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
            >
              <div className="w-6 text-lg font-bold text-primary">#{user.rank}</div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.displayName} />
                <AvatarFallback>{user.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{user.displayName}</div>
                <div className="text-xs text-muted">{user.beenCount} restaurants</div>
              </div>
              {user.rank === 1 && <IoTrophy className="h-5 w-5 text-yellow-500" />}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
