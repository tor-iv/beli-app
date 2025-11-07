'use client';

import { ArrowLeft, Share2, Bookmark, List as ListIcon, MapPin } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

import { RestaurantCard } from '@/components/restaurant/restaurant-card';
import { useCurrentUser } from '@/lib/hooks/use-user';
import { ListService, RestaurantService } from '@/lib/services';

import type { List, Restaurant } from '@/types';

export default function FeaturedListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  const { data: user } = useCurrentUser();
  const [list, setList] = useState<List | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [userProgress, setUserProgress] = useState({ visited: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const loadListDetails = useCallback(async () => {
    try {
      const listData = await ListService.getListById(listId);
      if (!listData) {
        router.push('/tastemakers');
        return;
      }

      setList(listData);

      // Load restaurants in the list
      const restaurantData = await Promise.all(
        listData.restaurants.map((id) => RestaurantService.getRestaurantById(id))
      );
      const validRestaurants = restaurantData.filter((r): r is Restaurant => r !== null);
      setRestaurants(validRestaurants);

      // Load user progress
      if (user) {
        const progress = await ListService.getUserListProgress(user.id, listId);
        setUserProgress(progress);
      }
    } catch (error) {
      console.error('Failed to load list details:', error);
    } finally {
      setLoading(false);
    }
  }, [listId, router, user]);

  useEffect(() => {
    loadListDetails();
  }, [loadListDetails]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: list?.name,
          text: list?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-800">Loading...</div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-800">List not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px]">
        <img
          src={
            list.thumbnailImage ||
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=500&fit=crop'
          }
          alt={list.name}
          className="h-full w-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Header Buttons */}
        <div className="safe-area-top absolute left-0 right-0 top-0 flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <Share2 className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">{list.name}</h1>
        </div>
      </div>

      {/* List/Map Toggle - Centered below hero */}
      <div className="bg-white px-4 pb-3 pt-4">
        <div className="mx-auto max-w-xs">
          <div className="flex rounded-full bg-gray-100 p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-800'} `}
            >
              <ListIcon className="h-4 w-4" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-primary text-white' : 'text-gray-800'} `}
            >
              <MapPin className="h-4 w-4" />
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 bg-white px-4 pb-4">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-100 py-3 font-medium transition-colors hover:bg-gray-200">
          <Bookmark className="h-5 w-5" />
          <span>Bookmark all</span>
        </button>
        <button
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-100 py-3 font-medium transition-colors hover:bg-gray-200"
        >
          <Share2 className="h-5 w-5" />
          <span>Share</span>
        </button>
      </div>

      {/* Description */}
      <div className="mb-6 bg-white px-6 py-5">
        <p className="mb-3 leading-relaxed text-gray-700">{list.description}</p>
        <p className="text-sm font-medium text-gray-800">
          You've been to {userProgress.visited} of {userProgress.total}
        </p>
      </div>

      {/* Restaurants List */}
      {viewMode === 'list' ? (
        <div className="space-y-4 px-4 pb-6">
          {restaurants.map((restaurant, index) => (
            <div key={restaurant.id} className="flex items-start gap-3">
              {/* Number Badge */}
              <div className="mt-2 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-white shadow-md">
                {index + 1}
              </div>
              {/* Restaurant Card */}
              <div className="min-w-0 flex-1">
                <RestaurantCard restaurant={restaurant} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 pb-6">
          <div className="rounded-lg bg-white p-8 text-center">
            <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-800" />
            <p className="text-gray-800">Map view coming soon!</p>
          </div>
        </div>
      )}
    </div>
  );
}
