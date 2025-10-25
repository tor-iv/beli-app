'use client';

import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { List } from '@/types';
import { IoRestaurant } from 'react-icons/io5';

interface FeaturedListsWidgetProps {
  lists: List[];
}

export function FeaturedListsWidget({ lists }: FeaturedListsWidgetProps) {
  // Show top 5 featured lists
  const displayLists = lists.slice(0, 5);

  return (
    <Card className="beli-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Featured Lists</h3>
          <Link href="/lists" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {displayLists.map((list) => (
            <Link
              key={list.id}
              href={`/lists/${list.id}`}
              className="block hover:bg-gray-50 p-3 rounded-lg transition-colors -mx-1"
            >
              <div className="font-medium text-sm mb-1">{list.name}</div>
              <div className="text-xs text-muted mb-2 line-clamp-2">
                {list.description}
              </div>
              <div className="flex items-center gap-1 text-xs text-primary">
                <IoRestaurant className="w-3.5 h-3.5" />
                <span>{list.restaurants.length} spots</span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
