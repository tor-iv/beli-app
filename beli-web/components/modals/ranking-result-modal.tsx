'use client';

import { ChevronLeft, Share2, Link as LinkIcon, Instagram, Music } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import { RatingBubble } from '@/components/rating/rating-bubble';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

import type { Restaurant, RankingResult, User } from '@/types';

interface RankingResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: Restaurant;
  user: User;
  result: RankingResult;
  notes?: string;
  photos?: string[];
  visitCount?: number;
  onDone: () => void;
}

export const RankingResultModal = ({
  open,
  onOpenChange,
  restaurant,
  user,
  result,
  notes,
  photos,
  visitCount = 1,
  onDone,
}: RankingResultModalProps) => {
  const handleShare = async (
    platform: 'copy' | 'instagram_story' | 'instagram_post' | 'tiktok' | 'message'
  ) => {
    const shareText = `Just rated ${restaurant.name} a ${result.rating} on Beli! 🍽️`;
    const shareUrl = `https://beli.app/restaurant/${restaurant.id}`;

    try {
      if (platform === 'copy' && navigator.share) {
        await navigator.share({
          title: shareText,
          url: shareUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        // Could show a toast here
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-full w-full max-w-none gap-0 border-0 bg-primary p-0 [&>button]:hidden">
        {/* Full screen teal background container */}
        <div className="flex h-full flex-col overflow-hidden bg-primary">
          {/* Navigation bar */}
          <div className="safe-area-top flex items-center justify-between px-4 py-3">
            <button
              onClick={onDone}
              className="rounded-full p-2 transition-colors hover:bg-white/10"
            >
              <ChevronLeft className="h-7 w-7 text-white" />
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="rounded-full p-2 transition-colors hover:bg-white/10"
            >
              <Share2 className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 pb-12 lg:px-8">
            <div className="mx-auto max-w-[500px] space-y-8 pt-8">
              {/* White card with rating */}
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                {/* User header */}
                <div className="mb-4 flex items-center">
                  <div className="relative mr-3 h-14 w-14">
                    <Image
                      src={user.avatar}
                      alt={user.displayName}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[17px] font-bold text-foreground">{user.displayName}</p>
                    <p className="text-sm text-secondary">@{user.username}</p>
                  </div>
                  <span className="text-[26px] font-bold italic text-primary">beli</span>
                </div>

                {/* Restaurant name and rating */}
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="mr-3 flex-1 text-2xl font-bold text-foreground">
                    {restaurant.name}
                  </h2>
                  <RatingBubble rating={result.rating} size="lg" />
                </div>

                {/* Location metadata */}
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-secondary">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>
                    {restaurant.priceRange} • {restaurant.location.neighborhood},{' '}
                    {restaurant.location.city}
                  </span>
                </div>

                {/* Visit count */}
                <div className="mb-3 flex items-center gap-1.5 text-[11px] text-secondary">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>
                    {visitCount} visit{visitCount !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Photo if available */}
                {photos && photos.length > 0 && (
                  <div className="relative mb-3 h-[180px] w-full overflow-hidden rounded-lg bg-gray-100">
                    <Image src={photos[0]} alt="Restaurant photo" fill className="object-cover" />
                  </div>
                )}

                {/* Notes */}
                {notes && (
                  <div className="text-base leading-relaxed text-foreground">
                    <span className="font-bold">Notes:</span> {notes}
                  </div>
                )}
              </div>

              {/* Share section */}
              <div className="rounded-2xl bg-white p-5 shadow-lg">
                <h3 className="mb-3 text-center text-lg font-bold text-foreground">
                  Share this page
                </h3>
                <div className="flex items-center justify-between px-1">
                  {/* Copy Link */}
                  <button
                    onClick={() => handleShare('copy')}
                    className="flex max-w-[80px] flex-col items-center gap-1.5"
                  >
                    <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-gray-500">
                      <LinkIcon className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-xs text-secondary">Copy Link</span>
                  </button>

                  {/* IG Story */}
                  <button
                    onClick={() => handleShare('instagram_story')}
                    className="flex max-w-[80px] flex-col items-center gap-1.5"
                  >
                    <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                      <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                      </svg>
                    </div>
                    <span className="text-xs text-secondary">IG Story</span>
                  </button>

                  {/* IG Post */}
                  <button
                    onClick={() => handleShare('instagram_post')}
                    className="flex max-w-[80px] flex-col items-center gap-1.5"
                  >
                    <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                      <Instagram className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-xs text-secondary">IG Post</span>
                  </button>

                  {/* TikTok */}
                  <button
                    onClick={() => handleShare('tiktok')}
                    className="flex max-w-[80px] flex-col items-center gap-1.5"
                  >
                    <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-black">
                      <Music className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-xs text-secondary">TikTok</span>
                  </button>

                  {/* Message */}
                  <button
                    onClick={() => handleShare('message')}
                    className="flex max-w-[80px] flex-col items-center gap-1.5"
                  >
                    <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-green-500">
                      <svg
                        className="h-7 w-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs text-secondary">Message</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
