'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { MatchPercentageBadge } from '@/components/ui/match-percentage-badge';
import { useSearchRestaurants } from '@/lib/hooks/use-restaurants';
import { useSearchUsers, useUserMatchPercentage } from '@/lib/hooks/use-users';
import { useUser } from '@/lib/hooks/use-user';
import { RestaurantCard } from '@/components/restaurant/restaurant-card';
import { RestaurantListItemCompact } from '@/components/restaurant/restaurant-list-item-compact';
import { RestaurantDetailPreview } from '@/components/restaurant/restaurant-detail-preview';
import { UserCard } from '@/components/social/user-card';
import { UserPreview } from '@/components/social/user-preview';
import { Search, MapPin, X, Clock, Store, Users, Calendar, Heart, TrendingUp } from 'lucide-react';
import { MockDataService } from '@/lib/mockDataService';
import { RecentSearch } from '@/data/mock/recentSearches';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { Restaurant, User } from '@/types';

type SearchTab = 'restaurants' | 'members';

const filterChips = [
  { id: 'reserve', label: 'Reserve now', icon: Calendar },
  { id: 'recs', label: 'Recs', icon: Heart },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
];

// Wrapper component to fetch and display user card with match percentage
function UserCardWithMatch({ user, currentUserId }: { user: User; currentUserId: string }) {
  const { data: matchPercentage } = useUserMatchPercentage(currentUserId, user.id);

  return <UserCard user={user} matchPercentage={matchPercentage} />;
}

// Desktop user list item with match percentage
function UserListItem({
  user,
  currentUserId,
  isSelected,
  onClick
}: {
  user: User;
  currentUserId: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { data: matchPercentage } = useUserMatchPercentage(currentUserId, user.id);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 transition-all border-b border-gray-100',
        'hover:bg-gray-50 cursor-pointer',
        isSelected && 'bg-primary/5'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
          {user.avatar && (
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{user.displayName}</h3>
            {matchPercentage !== undefined && (
              <MatchPercentageBadge percentage={matchPercentage} variant="compact" />
            )}
          </div>
          <p className="text-sm text-muted truncate">@{user.username}</p>
        </div>
        <div className="text-sm text-muted flex-shrink-0">
          {user.stats.beenCount} been
        </div>
      </div>
    </button>
  );
}

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<SearchTab>('restaurants');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('Current Location');
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: currentUser } = useUser('1'); // Current user ID
  const { data: restaurantResults, isLoading: restaurantsLoading } = useSearchRestaurants(query);
  const { data: userResults, isLoading: usersLoading } = useSearchUsers(query);

  useEffect(() => {
    // Load recent searches on mount
    MockDataService.getRecentSearches().then(setRecentSearches);
  }, []);

  // Auto-select first result on desktop
  useEffect(() => {
    if (activeTab === 'restaurants' && restaurantResults && restaurantResults.length > 0) {
      setSelectedRestaurant(restaurantResults[0]);
    }
  }, [restaurantResults, activeTab]);

  useEffect(() => {
    if (activeTab === 'members' && userResults && userResults.length > 0) {
      setSelectedUser(userResults[0]);
    }
  }, [userResults, activeTab]);

  const handleClearRecent = async (searchId: string) => {
    await MockDataService.clearRecentSearch(searchId);
    const updated = await MockDataService.getRecentSearches();
    setRecentSearches(updated);
  };

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const isLoading = activeTab === 'restaurants' ? restaurantsLoading : usersLoading;
  const results = activeTab === 'restaurants' ? restaurantResults : userResults;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/feed" className="flex items-center gap-2">
            <img src="/beli-logo.webp" alt="Beli" className="h-8" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-6 border-b">
          <button
            onClick={() => setActiveTab('restaurants')}
            className={cn(
              'pb-3 px-2 font-medium transition-colors relative',
              activeTab === 'restaurants'
                ? 'text-primary'
                : 'text-muted hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              <span>Restaurants</span>
            </div>
            {activeTab === 'restaurants' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={cn(
              'pb-3 px-2 font-medium transition-colors relative',
              activeTab === 'members'
                ? 'text-primary'
                : 'text-muted hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>Members</span>
            </div>
            {activeTab === 'members' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <Input
            type="search"
            placeholder={
              activeTab === 'restaurants'
                ? 'Search restaurant, cuisine, occasion'
                : 'Search members by name or username'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Location Input (only for restaurants) */}
        {activeTab === 'restaurants' && (
          <div className="relative mb-4">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <Input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
            />
            {location && location !== 'Current Location' && (
              <button
                onClick={() => setLocation('Current Location')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-muted hover:text-foreground" />
              </button>
            )}
          </div>
        )}

        {/* Filter Chips (only for restaurants) */}
        {activeTab === 'restaurants' && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {filterChips.map((chip) => {
              const IconComponent = chip.icon;
              return (
                <button
                  key={chip.id}
                  onClick={() => toggleFilter(chip.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors',
                    selectedFilters.includes(chip.id)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  <IconComponent className="w-4 h-4" />
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
            <h2 className="text-lg font-semibold mb-4">Recents</h2>
            <div className="divide-y divide-gray-100">
              {recentSearches.map((search) => (
                <div
                  key={search.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                >
                  <Link
                    href={`/restaurant/${search.restaurantId}`}
                    className="flex items-start gap-3 flex-1"
                  >
                    <Clock className="w-5 h-5 text-muted mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">{search.restaurantName}</h3>
                      <p className="text-sm text-muted">{search.location}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleClearRecent(search.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5 text-muted" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {query && results && results.length > 0 && (
          <>
            {/* Mobile: Grid layout */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {activeTab === 'restaurants'
                ? restaurantResults?.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))
                : userResults?.map((user) => (
                    <UserCardWithMatch key={user.id} user={user} currentUserId={currentUser?.id || '1'} />
                  ))}
            </div>

            {/* Desktop: Master/Detail layout */}
            <div className="hidden md:grid md:grid-cols-[2fr_3fr] gap-6">
              {/* Master: List of results */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-h-[calc(100vh-300px)] overflow-y-auto">
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
                        currentUserId={currentUser?.id || '1'}
                        isSelected={selectedUser?.id === user.id}
                        onClick={() => setSelectedUser(user)}
                      />
                    ))}
              </div>

              {/* Detail: Selected item preview */}
              <div className="sticky top-6 h-fit">
                {activeTab === 'restaurants' && selectedRestaurant ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <RestaurantDetailPreview restaurant={selectedRestaurant} />
                  </div>
                ) : activeTab === 'members' && selectedUser ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <UserPreview user={selectedUser} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p>Select an item to view details</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {query && results?.length === 0 && !isLoading && (
          <EmptyState
            icon={activeTab === 'restaurants' ? <Store className="w-16 h-16 text-muted" /> : <Users className="w-16 h-16 text-muted" />}
            title={`No ${activeTab} found`}
            description={`No results for "${query}"`}
          />
        )}

        {!query && activeTab === 'members' && (
          <EmptyState
            icon={<Search className="w-16 h-16 text-muted" />}
            title="Search for members"
            description="Start typing to search for members by name or username"
          />
        )}

        {!query && activeTab === 'restaurants' && recentSearches.length === 0 && (
          <EmptyState
            icon={<Search className="w-16 h-16 text-muted" />}
            title="Search for restaurants"
            description="Start typing to search for restaurants, cuisines, or occasions"
          />
        )}
      </div>
    </div>
  );
}
