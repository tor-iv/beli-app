'use client';

import Link from 'next/link';
import { IoChevronForward, IoLocationOutline } from 'react-icons/io5';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

import type { User } from '@/types';

interface UserPreviewProps {
  user: User;
}

export const UserPreview = ({ user }: UserPreviewProps) => {
  return (
    <div className="space-y-4">
      {/* User header */}
      <div className="flex items-start gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatar} alt={user.displayName} />
          <AvatarFallback>{user.displayName[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h2 className="mb-1 text-2xl font-bold">{user.displayName}</h2>
          <p className="mb-2 text-muted">@{user.username}</p>
          {user.location && (
            <div className="flex items-center gap-1 text-sm text-muted">
              <IoLocationOutline className="h-4 w-4" />
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
            <div className="mt-1 text-xs text-muted">Been</div>
          </CardContent>
        </Card>

        <Card className="beli-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{user.stats.followers}</div>
            <div className="mt-1 text-xs text-muted">Followers</div>
          </CardContent>
        </Card>

        <Card className="beli-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-streak">{user.stats.currentStreak}</div>
            <div className="mt-1 text-xs text-muted">Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Rank */}
      {user.stats.rank && (
        <Card className="beli-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1 text-sm text-muted">Leaderboard Rank</div>
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
          <h3 className="mb-2 text-sm font-semibold">Dietary Restrictions</h3>
          <div className="flex flex-wrap gap-2">
            {user.dietaryRestrictions.map((restriction, i) => (
              <span key={i} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                {restriction}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* View profile link */}
      <Link
        href={`/profile/${user.username}`}
        className="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
      >
        <span className="text-sm font-medium">View full profile</span>
        <IoChevronForward className="h-5 w-5 text-muted" />
      </Link>
    </div>
  );
}
