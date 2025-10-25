'use client';

import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export function TrendingWidget() {
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
        <h3 className="font-semibold mb-4">Trending</h3>
        <div className="space-y-3">
          {trending.map((item, index) => (
            <Link
              key={index}
              href={`/search?q=${encodeURIComponent(item.tag)}`}
              className="block hover:bg-gray-50 p-2 rounded-lg transition-colors -mx-2"
            >
              <div className="font-medium text-sm text-primary">{item.tag}</div>
              <div className="text-xs text-muted">{item.count}</div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
