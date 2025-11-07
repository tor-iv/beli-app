'use client';

import Image from 'next/image';
import Link from 'next/link';
import { IoHeart, IoBookmark, IoEye } from 'react-icons/io5';

import { Card, CardContent } from '@/components/ui/card';

import type { TastemakerPost } from '@/types';


interface TastemakerPostCardProps {
  post: TastemakerPost;
  variant?: 'default' | 'compact';
}

export const TastemakerPostCard = ({ post, variant = 'default' }: TastemakerPostCardProps) => {
  const { user } = post;
  if (!user) return null;

  if (variant === 'compact') {
    return (
      <Link href={`/tastemakers/posts/${post.id}`}>
        <Card className="beli-card cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="p-0">
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="relative h-24 w-24 flex-shrink-0">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="rounded-l-lg object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 py-3 pr-3">
                <h3 className="mb-1 line-clamp-2 text-sm font-semibold">{post.title}</h3>
                <p className="mb-2 text-xs text-muted">by {user.displayName}</p>
                <div
                  className="flex items-center gap-3 text-xs text-muted"
                  suppressHydrationWarning
                >
                  <span className="flex items-center gap-1">
                    <IoHeart size={14} />
                    {post.interactions.likes.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <IoEye size={14} />
                    {post.interactions.views}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/tastemakers/posts/${post.id}`}>
      <Card className="beli-card group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Cover Image - Enlarged */}
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Featured badge */}
          {post.isFeatured && (
            <div className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-lg">
              ⭐ Featured
            </div>
          )}

          {/* Author info on image */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <Image
              src={user.avatar}
              alt={user.displayName}
              width={32}
              height={32}
              className="rounded-full border-2 border-white shadow-md"
            />
            <div className="text-white">
              <p className="text-sm font-semibold drop-shadow-lg">{user.displayName}</p>
              <p className="text-xs opacity-90" suppressHydrationWarning>
                {post.publishedAt.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Read time badge */}
          <div className="absolute right-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm">
            {Math.ceil(post.content.split(' ').length / 200)} min read
          </div>
        </div>

        <CardContent className="p-5">
          {/* Title - Larger and bolder */}
          <h3 className="mb-2 line-clamp-2 text-xl font-bold transition-colors group-hover:text-primary">
            {post.title}
          </h3>

          {/* Subtitle */}
          {post.subtitle && (
            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted">{post.subtitle}</p>
          )}

          {/* Tags - More visual */}
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 2 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-muted">
                +{post.tags.length - 2} more
              </span>
            )}
          </div>

          {/* Engagement stats - More compact */}
          <div className="flex items-center justify-between border-t pt-4 text-sm">
            <div className="flex items-center gap-4 text-muted">
              <span className="flex items-center gap-1.5" suppressHydrationWarning>
                <IoEye size={16} className="text-primary" />
                <span className="font-medium">{post.interactions.views.toLocaleString()}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <IoHeart size={16} className="text-rose-500" />
                <span className="font-medium">{post.interactions.likes.length}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <IoBookmark size={16} className="text-amber-500" />
                <span className="font-medium">{post.interactions.bookmarks.length}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
