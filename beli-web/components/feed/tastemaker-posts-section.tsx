'use client';

import React from 'react';

import { TastemakerPostCard } from '@/components/tastemakers/tastemaker-post-card';

import type { TastemakerPost } from '@/types';

interface TastemakerPostsSectionProps {
  posts: TastemakerPost[];
}

export const TastemakerPostsSection = ({ posts }: TastemakerPostsSectionProps) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="py-8 text-center text-muted">
        <p>No tastemaker posts available</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Tastemaker Picks</h2>
        <button className="text-sm font-medium text-primary hover:text-primary/80">See All</button>
      </div>

      {/* Horizontal scrollable container */}
      <div className="scrollbar-hide -mx-4 overflow-x-auto px-4">
        <div className="flex gap-4 pb-2">
          {posts.map((post) => (
            <div key={post.id} className="w-80 flex-shrink-0">
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
