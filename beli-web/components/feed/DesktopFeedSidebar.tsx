'use client';

import { Utensils } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { RestaurantToggleWidget } from '@/components/profile/restaurant-toggle-widget';

/**
 * Desktop sidebar for feed page
 * Contains "Eat Now" button and restaurant toggle widget
 * Separated from main feed component for better organization
 */
export const DesktopFeedSidebar = () => {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* Eat Now Button - Navigate to group dinner feature */}
      <button
        onClick={() => router.push('/group-dinner')}
        className="hover:shadow-card-hover group flex w-full items-center justify-center gap-3 rounded-lg bg-white p-4 shadow-card transition-all duration-200"
        aria-label="Eat Now - Find restaurants for your group"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
          <Utensils className="h-6 w-6 text-primary" />
        </div>
        <span className="text-lg font-semibold text-gray-900">Eat Now</span>
      </button>

      {/* Restaurant Toggle Widget - Quick access to reservations, recs, etc. */}
      <RestaurantToggleWidget defaultView="reserve" />
    </div>
  );
}
