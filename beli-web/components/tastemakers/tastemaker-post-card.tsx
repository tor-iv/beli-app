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
                <div className="flex items-center gap-3 text-xs text-muted">
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
      <Card className="beli-card hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
        {/* Cover Image */}
        <div className="relative w-full h-48">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
          />
          {post.isFeatured && (
            <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
              Featured
            </div>
          )}
        </div>

        <CardContent className="p-6">
          {/* Author info */}
          <div className="flex items-center gap-3 mb-4">
            <Image
              src={user.avatar}
              alt={user.displayName}
              width={32}
              height={32}
              className="rounded-full"
            />
            <div>
              <p className="font-medium text-sm">{user.displayName}</p>
              <p className="text-xs text-muted">
                {post.publishedAt.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Title and subtitle */}
          <h3 className="font-bold text-lg mb-2 line-clamp-2">{post.title}</h3>
          {post.subtitle && (
            <p className="text-sm text-muted mb-4 line-clamp-2">{post.subtitle}</p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 rounded text-xs text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Engagement stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-muted">
              <span className="flex items-center gap-1">
                <IoHeart size={16} />
                {post.interactions.likes.length}
              </span>
              <span className="flex items-center gap-1">
                <IoBookmark size={16} />
                {post.interactions.bookmarks.length}
              </span>
              <span className="flex items-center gap-1">
                <IoEye size={16} />
                {post.interactions.views.toLocaleString()}
              </span>
            </div>
            <span className="text-primary font-medium">Read more →</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
