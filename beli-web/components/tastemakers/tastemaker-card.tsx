'use client';

import Link from 'next/link';
import Image from 'next/image';
import { User } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { IoCheckmarkCircle } from 'react-icons/io5';

interface TastemakerCardProps {
  tastemaker: User;
}

export function TastemakerCard({ tastemaker }: TastemakerCardProps) {
  const profile = tastemaker.tastemakerProfile;
  if (!profile) return null;

  return (
    <Link href={`/tastemakers/${tastemaker.username}`}>
      <Card className="beli-card hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          {/* Header with avatar and badges */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <Image
                src={tastemaker.avatar}
                alt={tastemaker.displayName}
                width={64}
                height={64}
                className="rounded-full"
              />
              <IoCheckmarkCircle
                className="absolute -bottom-1 -right-1 text-primary bg-white rounded-full"
                size={20}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1 truncate">
                {tastemaker.displayName}
              </h3>
              <p className="text-sm text-muted mb-2">@{tastemaker.username}</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                {profile.badges.slice(0, 3).map((badge) => (
                  <span
                    key={badge.type}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${badge.color}15`,
                      color: badge.color,
                    }}
                  >
                    {badge.icon && <span>{badge.icon}</span>}
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Specialty and tagline */}
          <div className="mb-4">
            <p className="font-medium text-sm mb-1">{profile.specialty}</p>
            <p className="text-sm text-muted line-clamp-2">{profile.tagline}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-4">
              <div>
                <span className="font-semibold">{tastemaker.stats.followers.toLocaleString()}</span>
                <span className="text-muted ml-1">followers</span>
              </div>
              <div>
                <span className="font-semibold">{profile.totalPosts}</span>
                <span className="text-muted ml-1">posts</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
