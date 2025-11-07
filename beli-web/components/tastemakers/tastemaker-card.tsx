'use client';

import Image from 'next/image';
import Link from 'next/link';
import { IoCheckmarkCircle } from 'react-icons/io5';

import { Card, CardContent } from '@/components/ui/card';

import type { User } from '@/types';


interface TastemakerCardProps {
  tastemaker: User;
}

export const TastemakerCard = ({ tastemaker }: TastemakerCardProps) => {
  const profile = tastemaker.tastemakerProfile;
  if (!profile) return null;

  return (
    <Link href={`/tastemakers/${tastemaker.username}`}>
      <Card className="beli-card group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl">
        <CardContent className="p-0">
          {/* Header section with gradient background */}
          <div
            className="relative p-6 pb-16"
            style={{
              background: `linear-gradient(135deg, ${profile.badges[0]?.color || '#0B7B7F'}15 0%, ${profile.badges[0]?.color || '#0B7B7F'}08 100%)`,
            }}
          >
            {/* Verified badge corner */}
            <div className="absolute right-3 top-3">
              <IoCheckmarkCircle className="text-primary drop-shadow-md" size={24} />
            </div>

            {/* Engagement rate indicator */}
            <div
              className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-primary shadow-sm backdrop-blur-sm"
              suppressHydrationWarning
            >
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
                  className="rounded-full border-4 border-white shadow-lg transition-transform group-hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Content section */}
          <div className="-mt-8 px-6 pb-6">
            {/* Name and username */}
            <div className="mb-3 text-center">
              <h3 className="mb-1 text-xl font-bold transition-colors group-hover:text-primary">
                {tastemaker.displayName}
              </h3>
              <p className="text-sm text-muted">@{tastemaker.username}</p>
            </div>

            {/* Specialty - Highlighted */}
            <div className="mb-4 text-center">
              <p className="mb-1 text-sm font-semibold text-primary">{profile.specialty}</p>
              <p className="line-clamp-2 text-sm leading-relaxed text-muted">{profile.tagline}</p>
            </div>

            {/* Badges - More prominent */}
            <div className="mb-4 flex flex-wrap justify-center gap-2">
              {profile.badges.map((badge) => (
                <span
                  key={badge.type}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm"
                  style={{
                    backgroundColor: `${badge.color}20`,
                    color: badge.color,
                    border: `1.5px solid ${badge.color}40`,
                  }}
                >
                  {badge.icon && <span className="text-sm">{badge.icon}</span>}
                  {badge.label}
                </span>
              ))}
            </div>

            {/* Stats - Visual grid */}
            <div className="grid grid-cols-3 gap-3 border-t pt-4">
              <div className="text-center" suppressHydrationWarning>
                <p className="text-lg font-bold text-primary">
                  {tastemaker.stats.followers.toLocaleString()}
                </p>
                <p className="text-xs text-muted">Followers</p>
              </div>
              <div className="border-x text-center">
                <p className="text-lg font-bold text-primary">{profile.totalPosts}</p>
                <p className="text-xs text-muted">Articles</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-primary">{profile.featuredListsCount}</p>
                <p className="text-xs text-muted">Lists</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
