'use client';

import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';

export const TrendingWidget = () => {
  const trending = [
    { tag: '#BrunchSpots', count: '1.2k posts' },
    { tag: '#DateNight', count: '890 posts' },
    { tag: '#MichelinStar', count: '756 posts' },
    { tag: '#HiddenGems', count: '642 posts' },
    { tag: '#Foodie', count: '2.1k posts' },
  ];

  return (
    <Card className="beli-card">
      <CardContent className="p-4">
        <h3 className="mb-4 font-semibold">Trending</h3>
        <div className="space-y-3">
          {trending.map((item, index) => (
            <Link
              key={index}
              href={`/search?q=${encodeURIComponent(item.tag)}`}
              className="-mx-2 block rounded-lg p-2 transition-colors hover:bg-gray-50"
            >
              <div className="text-sm font-medium text-primary">{item.tag}</div>
              <div className="text-xs text-muted">{item.count}</div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
