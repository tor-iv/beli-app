'use client';

import { ArrowLeft, Share2, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { Restaurant } from '@/types';

interface RestaurantNavOverlayProps {
  restaurant: Restaurant;
}

export const RestaurantNavOverlay = ({ restaurant }: RestaurantNavOverlayProps) => {
  const router = useRouter();

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out ${restaurant.name} on Beli`;

    if (navigator.share) {
      try {
        await navigator.share({ title: restaurant.name, text, url });
      } catch (error) {
        // User cancelled share or error occurred
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  return (
    <div className="flex items-center justify-between">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="h-11 w-11 rounded-full bg-white/90 shadow-md backdrop-blur-sm hover:bg-white"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          className="h-11 w-11 rounded-full bg-white/90 shadow-md backdrop-blur-sm hover:bg-white"
        >
          <Share2 className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-full bg-white/90 shadow-md backdrop-blur-sm hover:bg-white"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Report an issue</DropdownMenuItem>
            <DropdownMenuItem>Suggest an edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
