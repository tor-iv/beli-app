'use client';

import Link from 'next/link';
import { IoRestaurant } from 'react-icons/io5';

import { Card, CardContent } from '@/components/ui/card';

import type { List } from '@/types';


interface FeaturedListsWidgetProps {
  lists: List[];
}

export const FeaturedListsWidget = ({ lists }: FeaturedListsWidgetProps) => {
  // Show top 5 featured lists
  const displayLists = lists.slice(0, 5);

  return (
    <Card className="beli-card">
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between">
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
              className="-mx-1 block rounded-lg p-3 transition-colors hover:bg-gray-50"
            >
              <div className="mb-1 text-sm font-medium">{list.name}</div>
              <div className="mb-2 line-clamp-2 text-xs text-muted">{list.description}</div>
              <div className="flex items-center gap-1 text-xs text-primary">
                <IoRestaurant className="h-3.5 w-3.5" />
                <span>{list.restaurants.length} spots</span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
