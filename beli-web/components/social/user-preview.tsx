'use client';

import { User } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { IoChevronForward, IoLocationOutline } from 'react-icons/io5';

interface UserPreviewProps {
  user: User;
}

export function UserPreview({ user }: UserPreviewProps) {
  return (
    <div className="space-y-4">
      {/* User header */}
      <div className="flex items-start gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={user.avatar} alt={user.displayName} />
          <AvatarFallback>{user.displayName[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1">{user.displayName}</h2>
          <p className="text-muted mb-2">@{user.username}</p>
          {user.location && (
            <div className="flex items-center gap-1 text-sm text-muted">
              <IoLocationOutline className="w-4 h-4" />
              <span>
                {user.location.city}, {user.location.state}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <div>
          <p className="text-sm leading-relaxed">{user.bio}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="beli-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{user.stats.beenCount}</div>
            <div className="text-xs text-muted mt-1">Been</div>
          </CardContent>
        </Card>

        <Card className="beli-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{user.stats.followers}</div>
            <div className="text-xs text-muted mt-1">Followers</div>
          </CardContent>
        </Card>

        <Card className="beli-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-streak">
              {user.stats.currentStreak}
            </div>
            <div className="text-xs text-muted mt-1">Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Rank */}
      {user.stats.rank && (
        <Card className="beli-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted mb-1">Leaderboard Rank</div>
                <div className="text-3xl font-bold text-primary">#{user.stats.rank}</div>
              </div>
              <div className="text-4xl">🏆</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dietary restrictions */}
      {user.dietaryRestrictions && user.dietaryRestrictions.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 text-sm">Dietary Restrictions</h3>
          <div className="flex flex-wrap gap-2">
            {user.dietaryRestrictions.map((restriction, i) => (
              <span
                key={i}
                className="px-3 py-1 text-xs bg-gray-100 rounded-full text-gray-700"
              >
                {restriction}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* View profile link */}
      <Link
        href={`/profile/${user.username}`}
        className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium text-sm">View full profile</span>
        <IoChevronForward className="w-5 h-5 text-muted" />
      </Link>
    </div>
  );
}
