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
      <Card className="beli-card hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group">
        <CardContent className="p-0">
          {/* Header section with gradient background */}
          <div
            className="relative p-6 pb-16"
            style={{
              background: `linear-gradient(135deg, ${profile.badges[0]?.color || '#0B7B7F'}15 0%, ${profile.badges[0]?.color || '#0B7B7F'}08 100%)`
            }}
          >
            {/* Verified badge corner */}
            <div className="absolute top-3 right-3">
              <IoCheckmarkCircle
                className="text-primary drop-shadow-md"
                size={24}
              />
            </div>

            {/* Engagement rate indicator */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-primary shadow-sm" suppressHydrationWarning>
              {profile.engagementRate.toFixed(1)}% engagement
            </div>

            {/* Avatar - Much larger */}
            <div className="flex justify-center">
              <div className="relative">
                <Image
                  src={tastemaker.avatar}
                  alt={tastemaker.displayName}
                  width={100}
                  height={100}
                  className="rounded-full border-4 border-white shadow-lg group-hover:scale-105 transition-transform"
                />
              </div>
            </div>
          </div>

          {/* Content section */}
          <div className="px-6 pb-6 -mt-8">
            {/* Name and username */}
            <div className="text-center mb-3">
              <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">
                {tastemaker.displayName}
              </h3>
              <p className="text-sm text-muted">@{tastemaker.username}</p>
            </div>

            {/* Specialty - Highlighted */}
            <div className="text-center mb-4">
              <p className="font-semibold text-sm text-primary mb-1">{profile.specialty}</p>
              <p className="text-sm text-muted line-clamp-2 leading-relaxed">{profile.tagline}</p>
            </div>

            {/* Badges - More prominent */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {profile.badges.map((badge) => (
                <span
                  key={badge.type}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm"
                  style={{
                    backgroundColor: `${badge.color}20`,
                    color: badge.color,
                    border: `1.5px solid ${badge.color}40`
                  }}
                >
                  {badge.icon && <span className="text-sm">{badge.icon}</span>}
                  {badge.label}
                </span>
              ))}
            </div>

            {/* Stats - Visual grid */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t">
              <div className="text-center" suppressHydrationWarning>
                <p className="font-bold text-lg text-primary">{tastemaker.stats.followers.toLocaleString()}</p>
                <p className="text-xs text-muted">Followers</p>
              </div>
              <div className="text-center border-x">
                <p className="font-bold text-lg text-primary">{profile.totalPosts}</p>
                <p className="text-xs text-muted">Articles</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-primary">{profile.featuredListsCount}</p>
                <p className="text-xs text-muted">Lists</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
