'use client';

import Link from 'next/link';

import { TastemakerPostCard } from '@/components/tastemakers/tastemaker-post-card';
import { Card, CardContent } from '@/components/ui/card';

import type { TastemakerPost } from '@/types';

interface TastemakerPicksWidgetProps {
  featuredPost?: TastemakerPost;
  recentPosts?: TastemakerPost[];
}

export const TastemakerPicksWidget = ({
  featuredPost,
  recentPosts = [],
}: TastemakerPicksWidgetProps) => {
  return (
    <Card className="beli-card">
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between">
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
            className="block rounded-lg py-3 text-center text-sm font-medium text-primary transition-colors hover:bg-gray-50"
          >
            Discover more from tastemakers →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
