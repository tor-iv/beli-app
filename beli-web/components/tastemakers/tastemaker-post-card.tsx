'use client';

import Link from 'next/link';
import Image from 'next/image';
import { TastemakerPost } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { IoHeart, IoBookmark, IoEye } from 'react-icons/io5';

interface TastemakerPostCardProps {
  post: TastemakerPost;
  variant?: 'default' | 'compact';
}

export function TastemakerPostCard({ post, variant = 'default' }: TastemakerPostCardProps) {
  const { user } = post;
  if (!user) return null;

  if (variant === 'compact') {
    return (
      <Link href={`/tastemakers/posts/${post.id}`}>
        <Card className="beli-card hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-0">
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover rounded-l-lg"
                />
              </div>

              {/* Content */}
              <div className="flex-1 py-3 pr-3">
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-xs text-muted mb-2">
                  by {user.displayName}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted" suppressHydrationWarning>
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
      <Card className="beli-card hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group">
        {/* Cover Image - Enlarged */}
        <div className="relative w-full h-64 overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Featured badge */}
          {post.isFeatured && (
            <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
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
              <p className="font-semibold text-sm drop-shadow-lg">{user.displayName}</p>
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
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-gray-700">
            {Math.ceil(post.content.split(' ').length / 200)} min read
          </div>
        </div>

        <CardContent className="p-5">
          {/* Title - Larger and bolder */}
          <h3 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          {/* Subtitle */}
          {post.subtitle && (
            <p className="text-sm text-muted mb-4 line-clamp-2 leading-relaxed">{post.subtitle}</p>
          )}

          {/* Tags - More visual */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 2 && (
              <span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-muted">
                +{post.tags.length - 2} more
              </span>
            )}
          </div>

          {/* Engagement stats - More compact */}
          <div className="flex items-center justify-between text-sm border-t pt-4">
            <div className="flex items-center gap-4 text-muted">
              <span className="flex items-center gap-1.5">
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
