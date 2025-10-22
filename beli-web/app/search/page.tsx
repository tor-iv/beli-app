'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useSearchRestaurants } from '@/lib/hooks/use-restaurants';
import { RestaurantCard } from '@/components/restaurant/restaurant-card';
import { Search as SearchIcon } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const { data: results, isLoading } = useSearchRestaurants(query);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Search Restaurants</h1>

      <div className="relative mb-6">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <Input
          type="search"
          placeholder="Search by name, cuisine, neighborhood..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading && <div className="text-center py-8 text-muted">Searching...</div>}

      {results && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}

      {query && results?.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted">
          No restaurants found for &quot;{query}&quot;
        </div>
      )}

      {!query && (
        <div className="text-center py-12 text-muted">
          Start typing to search for restaurants
        </div>
      )}
    </div>
  );
}
