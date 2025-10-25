import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MockDataService } from '@/lib/mockDataService';
import { RestaurantListItemCompact } from '@/components/restaurant/restaurant-list-item-compact';
import { IoHeart, IoHeartOutline, IoBookmark, IoBookmarkOutline, IoEye, IoShareSocial } from 'react-icons/io5';

interface PageProps {
  params: { id: string };
}

export default async function TastemakerPostPage({ params }: PageProps) {
  const { id } = params;

  // Fetch post data
  const post = await MockDataService.getTastemakerPostById(id);
  if (!post || !post.user) {
    notFound();
  }

  // Increment view count (in real app, this would be a client-side mutation)
  await MockDataService.incrementPostViews(id);

  const { user } = post;

  return (
    <div className="container mx-auto px-4 py-6">
      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>

          {/* Subtitle */}
          {post.subtitle && (
            <p className="text-xl text-muted mb-6">{post.subtitle}</p>
          )}

          {/* Author info and meta */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <Link
              href={`/tastemakers/${user.username}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Image
                src={user.avatar}
                alt={user.displayName}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold">{user.displayName}</p>
                <p className="text-sm text-muted">
                  {post.publishedAt.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </Link>

            {/* Engagement stats */}
            <div className="flex items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1">
                <IoEye size={18} />
                {post.interactions.views.toLocaleString()} views
              </span>
              <span className="flex items-center gap-1">
                <IoHeart size={18} />
                {post.interactions.likes.length}
              </span>
              <span className="flex items-center gap-1">
                <IoBookmark size={18} />
                {post.interactions.bookmarks.length}
              </span>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="relative w-full h-[400px] md:h-[500px] mb-8 rounded-xl overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mb-8 pb-8 border-b">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors">
            <IoHeartOutline size={20} />
            <span className="font-medium">Like</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors">
            <IoBookmarkOutline size={20} />
            <span className="font-medium">Save</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors">
            <IoShareSocial size={20} />
            <span className="font-medium">Share</span>
          </button>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12">
          {/* Render content with line breaks preserved */}
          {post.content.split('\n').map((paragraph, index) => {
            // Handle headers (lines starting with **)
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              const text = paragraph.replace(/\*\*/g, '');
              return (
                <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                  {text}
                </h2>
              );
            }

            // Handle empty lines
            if (paragraph.trim() === '') {
              return <br key={index} />;
            }

            // Handle regular paragraphs with possible bold text
            const parts = paragraph.split(/(\*\*.*?\*\*)/g);
            return (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                {parts.map((part, partIndex) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={partIndex}>{part.replace(/\*\*/g, '')}</strong>;
                  }
                  return part;
                })}
              </p>
            );
          })}
        </div>

        {/* Featured Restaurants */}
        {post.restaurants && post.restaurants.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Restaurants</h2>
            <div className="space-y-4">
              {post.restaurants.map((restaurant) => (
                <RestaurantListItemCompact key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </div>
        )}

        {/* Author CTA */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Image
              src={user.avatar}
              alt={user.displayName}
              width={64}
              height={64}
              className="rounded-full"
            />
            <div className="flex-1">
              <p className="font-semibold text-lg mb-1">{user.displayName}</p>
              <p className="text-sm text-muted mb-2">{user.tastemakerProfile?.specialty}</p>
              <p className="text-sm text-muted">{user.bio}</p>
            </div>
            <Link
              href={`/tastemakers/${user.username}`}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              View Profile
            </Link>
          </div>
        </div>

        {/* More from this author */}
        <div>
          <h2 className="text-2xl font-bold mb-6">More from {user.displayName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Placeholder for related posts */}
            <p className="text-muted col-span-2">
              Check out more articles from {user.displayName} on their{' '}
              <Link href={`/tastemakers/${user.username}`} className="text-primary hover:underline">
                profile page
              </Link>
              .
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
