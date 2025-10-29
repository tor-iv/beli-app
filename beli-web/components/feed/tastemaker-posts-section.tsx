'use client';

import React from 'react';
import { TastemakerPost } from '@/types';
import { TastemakerPostCard } from '@/components/tastemakers/tastemaker-post-card';

interface TastemakerPostsSectionProps {
  posts: TastemakerPost[];
}

export function TastemakerPostsSection({ posts }: TastemakerPostsSectionProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        <p>No tastemaker posts available</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Tastemaker Picks</h2>
        <button className="text-sm text-primary hover:text-primary/80 font-medium">
          See All
        </button>
      </div>

      {/* Horizontal scrollable container */}
      <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-4 pb-2">
          {posts.map((post) => (
            <div key={post.id} className="flex-shrink-0 w-80">
              <TastemakerPostCard post={post} variant="compact" />
            </div>
          ))}
        </div>
      </div>

      {/* Add scrollbar hide utility */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
