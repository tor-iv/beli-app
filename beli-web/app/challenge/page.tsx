'use client';

import { ChevronLeft, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { ChallengeActivityCard } from '@/components/challenge/challenge-activity-card';
import { ChallengeProgressCard } from '@/components/challenge/challenge-progress-card';
import { CircularBadge } from '@/components/challenge/circular-badge';
import { useUser } from '@/lib/hooks/use-user';


export default function ChallengePage() {
  const { data: user, isLoading } = useUser('1');
  const [showStickyHeader, setShowStickyHeader] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowStickyHeader(window.scrollY > 150);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-secondary">Loading...</p>
      </div>
    );
  }

  const challenge = user.stats.challenge2025;
  if (!challenge) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-secondary">No challenge data available</p>
      </div>
    );
  }

  const now = new Date();
  const endDate = new Date(challenge.endDate);
  const daysLeft = Math.max(
    0,
    Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Mock activity data - in a real app, this would come from the API
  const activities = [
    {
      month: 'JANUARY 2025',
      items: [
        {
          userAvatar: user.avatar,
          userName: user.username,
          restaurantName: 'Carbone',
          cuisine: 'Italian',
          neighborhood: 'Greenwich Village',
          rating: 9.2,
          notes: 'The spicy rigatoni was incredible. Best Italian in NYC.',
          date: 'January 15',
        },
        {
          userAvatar: user.avatar,
          userName: user.username,
          restaurantName: 'Le Bernardin',
          cuisine: 'French Seafood',
          neighborhood: 'Midtown',
          rating: 9.5,
          notes: 'Impeccable service and the tasting menu was outstanding.',
          date: 'January 8',
        },
      ],
    },
    {
      month: 'DECEMBER 2024',
      items: [
        {
          userAvatar: user.avatar,
          userName: user.username,
          restaurantName: 'Masa',
          cuisine: 'Japanese',
          neighborhood: 'Midtown',
          rating: 9.8,
          date: 'December 28',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header (appears on scroll) */}
      {showStickyHeader && (
        <div className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white shadow-sm duration-200 animate-in fade-in slide-in-from-top-2">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <Link href="/feed">
              <ChevronLeft className="h-6 w-6 text-secondary transition-colors hover:text-foreground" />
            </Link>
            <h1 className="truncate text-lg font-semibold text-foreground">
              2025 Restaurant Challenge
            </h1>
            <button className="p-2">
              <MoreVertical className="h-5 w-5 text-secondary" />
            </button>
          </div>
        </div>
      )}

      {/* Teal Header Section */}
      <div className="relative bg-primary pb-20 text-white">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/feed">
              <ChevronLeft className="h-6 w-6 text-white transition-opacity hover:opacity-80" />
            </Link>
            <span className="text-xl font-semibold">beli</span>
            <button className="p-2">
              <MoreVertical className="h-5 w-5 text-white" />
            </button>
          </div>

          <h1 className="mb-4 text-center text-3xl font-bold">2025 Restaurant Challenge</h1>
        </div>
      </div>

      {/* Circular Badge (overlapping header/content) */}
      <div className="relative -mt-20 mb-6 flex justify-center">
        <CircularBadge year={challenge.year} />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 pb-8">
        {/* Progress Card */}
        <div className="mb-8">
          <ChallengeProgressCard
            currentCount={challenge.currentCount}
            goalCount={challenge.goalCount}
            daysLeft={daysLeft}
          />
        </div>

        {/* Monthly Timeline */}
        <div className="space-y-0">
          {activities.map((monthData) => (
            <div key={monthData.month}>
              {/* Month Header */}
              <div className="sticky top-0 z-10 bg-gray-200 px-4 py-2">
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">
                  {monthData.month}
                </h2>
              </div>

              {/* Activity Cards */}
              <div className="border-b border-gray-200 bg-white shadow-sm">
                {monthData.items.map((activity, index) => (
                  <ChallengeActivityCard key={index} {...activity} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (if no activities for current month) */}
        {challenge.currentCount === 0 && (
          <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <p className="mb-2 text-lg font-semibold text-foreground">Start your challenge!</p>
            <p className="text-sm text-secondary">
              Visit and rate your first restaurant to begin tracking your 2025 progress.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
