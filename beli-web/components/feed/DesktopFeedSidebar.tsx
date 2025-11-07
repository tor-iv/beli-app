'use client';

import { useRouter } from 'next/navigation';
import { Utensils } from 'lucide-react';
import { RestaurantToggleWidget } from '@/components/profile/restaurant-toggle-widget';

/**
 * Desktop sidebar for feed page
 * Contains "Eat Now" button and restaurant toggle widget
 * Separated from main feed component for better organization
 */
export function DesktopFeedSidebar() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* Eat Now Button - Navigate to group dinner feature */}
      <button
        onClick={() => router.push('/group-dinner')}
        className="w-full bg-white rounded-lg shadow-card p-4 hover:shadow-card-hover transition-all duration-200 flex items-center justify-center gap-3 group"
        aria-label="Eat Now - Find restaurants for your group"
      >
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Utensils className="h-6 w-6 text-primary" />
        </div>
        <span className="text-lg font-semibold text-gray-900">Eat Now</span>
      </button>

      {/* Restaurant Toggle Widget - Quick access to reservations, recs, etc. */}
      <RestaurantToggleWidget defaultView="reserve" />
    </div>
  );
}
