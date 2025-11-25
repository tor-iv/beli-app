'use client';

import { Search, X, Clock, Store, Users, Calendar, Heart, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';

import { RestaurantCard } from '@/components/restaurant/restaurant-card';
import { RestaurantDetailPreview } from '@/components/restaurant/restaurant-detail-preview';
import { RestaurantListItemCompact } from '@/components/restaurant/restaurant-list-item-compact';
import {
  LocationAutocomplete,
  type SelectedLocation,
} from '@/components/search/location-autocomplete';
import { UserCard } from '@/components/social/user-card';
import { UserPreview } from '@/components/social/user-preview';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MatchPercentageBadge } from '@/components/ui/match-percentage-badge';
import { DEFAULT_CITY } from '@/lib/constants/cities';
import { useGeolocation } from '@/lib/hooks/use-geolocation';
import { useSearchRestaurants } from '@/lib/hooks/use-restaurants';
import { useUser } from '@/lib/hooks/use-user';
import {
  useSearchUsers,
  useUserMatchPercentage,
  useBatchMatchPercentages,
} from '@/lib/hooks/use-users';
import { SearchHistoryService } from '@/lib/services';
import { cn } from '@/lib/utils';

import type { Restaurant, User, RecentSearch } from '@/types';

type SearchTab = 'restaurants' | 'members';

const filterChips = [
  { id: 'reserve', label: 'Reserve now', icon: Calendar },
  { id: 'recs', label: 'Recs', icon: Heart },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
];

// Wrapper component to display user card with match percentage (percentage passed from parent)
const UserCardWithMatch = ({ user, matchPercentage }: { user: User; matchPercentage?: number }) => {
  return <UserCard user={user} matchPercentage={matchPercentage} />;
}

// Desktop user list item with match percentage (percentage passed from parent)
const UserListItem = ({
  user,
  matchPercentage,
  isSelected,
  onClick,
}: {
  user: User;
  matchPercentage?: number;
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full border-b border-gray-100 p-4 text-left transition-all',
        'cursor-pointer hover:bg-gray-50',
        isSelected && 'bg-primary/5'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
          {user.avatar && (
            <img src={user.avatar} alt={user.displayName} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold">{user.displayName}</h3>
            {matchPercentage !== undefined && (
              <MatchPercentageBadge percentage={matchPercentage} variant="compact" />
            )}
          </div>
          <p className="truncate text-sm text-muted">@{user.username}</p>
        </div>
        <div className="flex-shrink-0 text-sm text-muted">{user.stats.beenCount} been</div>
      </div>
    </button>
  );
}

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<SearchTab>('restaurants');
  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Geolocation - auto-request on page load
  const {
    coordinates: geoCoords,
    status: geoStatus,
    requestLocation,
  } = useGeolocation({ autoRequest: true });

  // Set location when geolocation resolves
  useEffect(() => {
    if (geoStatus === 'granted' && geoCoords && !selectedLocation) {
      setSelectedLocation({
        type: 'current',
        displayName: 'Current Location',
        coordinates: geoCoords,
      });
    } else if ((geoStatus === 'denied' || geoStatus === 'error') && !selectedLocation) {
      // Fall back to NYC (where most mock data is)
      setSelectedLocation({
        type: 'city',
        displayName: DEFAULT_CITY.displayName,
        coordinates: DEFAULT_CITY.coordinates,
      });
    }
  }, [geoStatus, geoCoords, selectedLocation]);

  const { data: currentUser } = useUser('1'); // Current user ID
  const { data: restaurantResults, isLoading: restaurantsLoading } = useSearchRestaurants(query, {
    location: selectedLocation?.coordinates,
  });
  const { data: userResults, isLoading: usersLoading } = useSearchUsers(query);

  // Batch fetch match percentages for all user results (avoids N+1 queries)
  const userIds = useMemo(() => userResults?.map((u) => u.id) || [], [userResults]);
  const { data: matchPercentages } = useBatchMatchPercentages(currentUser?.id || '1', userIds);

  useEffect(() => {
    // Load recent searches on mount
    SearchHistoryService.getRecentSearches().then(setRecentSearches);
  }, []);

  // Auto-select first result on desktop (combined effect for both tabs)
  useEffect(() => {
    if (activeTab === 'restaurants' && restaurantResults && restaurantResults.length > 0) {
      setSelectedRestaurant(restaurantResults[0]);
      setSelectedUser(null); // Clear user selection when on restaurants tab
    } else if (activeTab === 'members' && userResults && userResults.length > 0) {
      setSelectedUser(userResults[0]);
      setSelectedRestaurant(null); // Clear restaurant selection when on members tab
    }
  }, [restaurantResults, userResults, activeTab]);

  const handleClearRecent = async (searchId: string) => {
    await SearchHistoryService.clearRecentSearch(searchId);
    const updated = await SearchHistoryService.getRecentSearches();
    setRecentSearches(updated);
  };

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]
    );
  };

  const isLoading = activeTab === 'restaurants' ? restaurantsLoading : usersLoading;
  const results = activeTab === 'restaurants' ? restaurantResults : userResults;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-7xl">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/feed" className="flex items-center gap-2">
            <img src="/beli-logo.webp" alt="Beli" className="h-8" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-8 border-b">
          <button
            onClick={() => setActiveTab('restaurants')}
            className={cn(
              'relative px-2 pb-3 font-medium transition-colors',
              activeTab === 'restaurants' ? 'text-primary' : 'text-muted hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              <span>Restaurants</span>
            </div>
            {activeTab === 'restaurants' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={cn(
              'relative px-2 pb-3 font-medium transition-colors',
              activeTab === 'members' ? 'text-primary' : 'text-muted hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Members</span>
            </div>
            {activeTab === 'members' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            placeholder={
              activeTab === 'restaurants'
                ? 'Search restaurant, cuisine, occasion'
                : 'Search members by name or username'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 pl-10 text-base"
          />
        </div>

        {/* Location Input (only for restaurants) */}
        {activeTab === 'restaurants' && (
          <LocationAutocomplete
            value={selectedLocation?.displayName || 'Current Location'}
            onLocationSelect={setSelectedLocation}
            geoStatus={geoStatus}
            geoCoordinates={geoCoords}
            onRequestLocation={requestLocation}
            className="mb-4"
          />
        )}

        {/* Filter Chips (only for restaurants) */}
        {activeTab === 'restaurants' && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {filterChips.map((chip) => {
              const IconComponent = chip.icon;
              return (
                <button
                  key={chip.id}
                  onClick={() => toggleFilter(chip.id)}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    selectedFilters.includes(chip.id)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Results / Recent Searches */}
        {isLoading && (
          <div className="py-12">
            <LoadingSpinner size="lg" text="Searching..." />
          </div>
        )}

        {!query && activeTab === 'restaurants' && recentSearches.length > 0 && (
          <div className="mb-6 max-w-4xl">
            <h2 className="mb-4 text-lg font-semibold">Recents</h2>
            <div className="divide-y divide-gray-100">
              {recentSearches.map((search) => (
                <div
                  key={search.id}
                  className="flex items-center justify-between p-3 transition-colors hover:bg-gray-50"
                >
                  <Link
                    href={`/restaurant/${search.restaurantId}`}
                    className="flex flex-1 items-start gap-3"
                  >
                    <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted" />
                    <div>
                      <h3 className="font-medium">{search.restaurantName}</h3>
                      <p className="text-sm text-muted">{search.location}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleClearRecent(search.id)}
                    className="flex-shrink-0 rounded p-1 transition-colors hover:bg-gray-200"
                  >
                    <X className="h-5 w-5 text-muted" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {query && results && results.length > 0 && (
          <>
            {/* Mobile: Grid layout */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {activeTab === 'restaurants'
                ? restaurantResults?.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))
                : userResults?.map((user) => (
                    <UserCardWithMatch
                      key={user.id}
                      user={user}
                      matchPercentage={matchPercentages?.[user.id]}
                    />
                  ))}
            </div>

            {/* Desktop: Master/Detail layout */}
            <div className="hidden gap-6 md:grid md:grid-cols-[2fr_3fr]">
              {/* Master: List of results */}
              <div className="max-h-[calc(100vh-300px)] overflow-hidden overflow-y-auto rounded-lg border border-gray-200 bg-white">
                {activeTab === 'restaurants'
                  ? restaurantResults?.map((restaurant) => (
                      <RestaurantListItemCompact
                        key={restaurant.id}
                        restaurant={restaurant}
                        isSelected={selectedRestaurant?.id === restaurant.id}
                        onClick={() => setSelectedRestaurant(restaurant)}
                      />
                    ))
                  : userResults?.map((user) => (
                      <UserListItem
                        key={user.id}
                        user={user}
                        matchPercentage={matchPercentages?.[user.id]}
                        isSelected={selectedUser?.id === user.id}
                        onClick={() => setSelectedUser(user)}
                      />
                    ))}
              </div>

              {/* Detail: Selected item preview */}
              <div className="sticky top-6 h-fit">
                {activeTab === 'restaurants' && selectedRestaurant ? (
                  <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <RestaurantDetailPreview restaurant={selectedRestaurant} />
                  </div>
                ) : activeTab === 'members' && selectedUser ? (
                  <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <UserPreview user={selectedUser} />
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-muted">
                    <p>Select an item to view details</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {query && results?.length === 0 && !isLoading && (
          <EmptyState
            icon={
              activeTab === 'restaurants' ? (
                <Store className="h-16 w-16 text-muted" />
              ) : (
                <Users className="h-16 w-16 text-muted" />
              )
            }
            title={`No ${activeTab} found`}
            description={`No results for "${query}"`}
          />
        )}

        {!query && activeTab === 'members' && (
          <EmptyState
            icon={<Search className="h-16 w-16 text-muted" />}
            title="Search for members"
            description="Start typing to search for members by name or username"
          />
        )}

        {!query && activeTab === 'restaurants' && recentSearches.length === 0 && (
          <EmptyState
            icon={<Search className="h-16 w-16 text-muted" />}
            title="Search for restaurants"
            description="Start typing to search for restaurants, cuisines, or occasions"
          />
        )}
      </div>
    </div>
  );
}
