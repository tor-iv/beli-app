'use client';

import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { TastemakerPost } from '@/types';
import { TastemakerPostCard } from '@/components/tastemakers/tastemaker-post-card';

interface TastemakerPicksWidgetProps {
  featuredPost?: TastemakerPost;
  recentPosts?: TastemakerPost[];
}

export function TastemakerPicksWidget({ featuredPost, recentPosts = [] }: TastemakerPicksWidgetProps) {
  return (
    <Card className="beli-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Tastemaker Picks</h3>
          <Link href="/tastemakers" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        <div className="space-y-3">
          {/* Featured post (if provided) */}
          {featuredPost && (
            <div className="mb-4">
              <TastemakerPostCard post={featuredPost} variant="compact" />
            </div>
          )}

          {/* Recent posts */}
          {recentPosts.slice(0, 3).map((post) => (
            <TastemakerPostCard key={post.id} post={post} variant="compact" />
          ))}

          {/* Call to action */}
          <Link
            href="/tastemakers"
            className="block text-center py-3 text-sm font-medium text-primary hover:bg-gray-50 rounded-lg transition-colors"
          >
            Discover more from tastemakers →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
