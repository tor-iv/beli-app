import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  IoHeart,
  IoHeartOutline,
  IoBookmark,
  IoBookmarkOutline,
  IoEye,
  IoShareSocial,
  IoTrendingUp,
} from 'react-icons/io5';

import { InlineRestaurantCard } from '@/components/tastemakers/inline-restaurant-card';
import { PhotoGalleryGrid } from '@/components/tastemakers/photo-gallery-grid';
import { TableOfContents } from '@/components/tastemakers/table-of-contents';
import { TastemakerPostService } from '@/lib/services';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TastemakerPostPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch post data
  const post = await TastemakerPostService.getTastemakerPostById(id);
  if (!post || !post.user) {
    notFound();
  }

  // Increment view count (in real app, this would be a client-side mutation)
  await TastemakerPostService.incrementPostViews(id);

  const { user } = post;

  // Check if article is trending (views > 3000)
  const isTrending = post.interactions.views > 3000;

  return (
    <div className="container mx-auto px-4 py-6">
      <article className="mx-auto max-w-5xl">
        {/* Infatuation-style Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <Link
            href="/tastemakers"
            className="font-semibold text-muted transition-colors hover:text-primary"
          >
            NEW YORK
          </Link>
          <span className="text-muted">/</span>
          <Link
            href="/tastemakers"
            className="font-semibold text-muted transition-colors hover:text-primary"
          >
            GUIDES
          </Link>
          <span className="text-muted">/</span>
          <span className="line-clamp-1 text-xs font-semibold uppercase text-gray-900">
            {post.title}
          </span>
        </div>

        {/* Trending Badge */}
        {isTrending && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2">
            <IoTrendingUp className="text-primary" size={18} />
            <span className="text-sm font-bold text-primary">THIS GUIDE IS TRENDING NOW</span>
            <span className="ml-2 text-xs text-primary/70">
              {post.interactions.views.toLocaleString()} views
            </span>
          </div>
        )}

        {/* Cover Image - Full width hero */}
        <div className="relative mb-8 h-[500px] w-full overflow-hidden rounded-2xl shadow-2xl md:h-[600px]">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Title overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white md:p-10">
            {/* Tags */}
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur-md"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Title with yellow highlight effect (Infatuation-style) */}
            <h1 className="mb-4 max-w-4xl text-4xl font-bold leading-tight drop-shadow-lg md:text-6xl">
              <span className="relative inline-block">
                {post.title}
                <span className="absolute bottom-2 left-0 right-0 -z-10 h-3 bg-yellow-300/40"></span>
              </span>
            </h1>

            {/* Subtitle */}
            {post.subtitle && (
              <p className="mb-6 max-w-3xl text-lg opacity-95 drop-shadow-md md:text-2xl">
                {post.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Meta bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-6">
          {/* Author info */}
          <Link
            href={`/tastemakers/${user.username}`}
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <Image
              src={user.avatar}
              alt={user.displayName}
              width={56}
              height={56}
              className="rounded-full border-2 border-primary"
            />
            <div>
              <p className="text-lg font-bold">{user.displayName}</p>
              <p className="text-sm font-medium text-primary">
                {user.tastemakerProfile?.specialty}
              </p>
              <p className="text-xs text-muted">
                {post.publishedAt.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                · {Math.ceil(post.content.split(' ').length / 200)} min read
              </p>
            </div>
          </Link>

          {/* Engagement stats - Larger */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="mb-1 flex items-center justify-center gap-1.5 text-primary">
                <IoEye size={20} />
                <span className="text-lg font-bold">
                  {post.interactions.views.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted">Views</p>
            </div>
            <div className="text-center">
              <div className="mb-1 flex items-center justify-center gap-1.5 text-rose-500">
                <IoHeart size={20} />
                <span className="text-lg font-bold">{post.interactions.likes.length}</span>
              </div>
              <p className="text-xs text-muted">Likes</p>
            </div>
            <div className="text-center">
              <div className="mb-1 flex items-center justify-center gap-1.5 text-amber-500">
                <IoBookmark size={20} />
                <span className="text-lg font-bold">{post.interactions.bookmarks.length}</span>
              </div>
              <p className="text-xs text-muted">Saves</p>
            </div>
          </div>
        </div>

        {/* Photo Gallery Grid (Infatuation-style) */}
        {post.restaurants && post.restaurants.length > 0 && (
          <PhotoGalleryGrid restaurants={post.restaurants} />
        )}

        {/* Action Buttons - More prominent */}
        <div className="mb-10 flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl bg-rose-50 px-6 py-3 font-medium text-rose-600 shadow-sm transition-colors hover:bg-rose-100">
            <IoHeartOutline size={22} />
            <span>Like Article</span>
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-amber-50 px-6 py-3 font-medium text-amber-600 shadow-sm transition-colors hover:bg-amber-100">
            <IoBookmarkOutline size={22} />
            <span>Save</span>
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-primary/10 px-6 py-3 font-medium text-primary shadow-sm transition-colors hover:bg-primary/20">
            <IoShareSocial size={22} />
            <span>Share</span>
          </button>
        </div>

        {/* Content with Sidebar Layout */}
        <div className="mb-12 lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Main Content */}
          <div className="prose prose-lg max-w-none lg:col-span-8">
            {/* Render content with line breaks preserved */}
            {post.content.split('\n').map((paragraph, index) => {
              // Handle headers (lines starting with **)
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                const text = paragraph.replace(/\*\*/g, '');
                return (
                  <h2
                    key={index}
                    id={`heading-${index}`}
                    className="mb-5 mt-10 scroll-mt-24 text-3xl font-bold text-gray-900"
                  >
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
                <p key={index} className="mb-5 text-lg leading-relaxed text-gray-700">
                  {parts.map((part, partIndex) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return (
                        <strong key={partIndex} className="font-bold text-gray-900">
                          {part.replace(/\*\*/g, '')}
                        </strong>
                      );
                    }
                    return part;
                  })}
                </p>
              );
            })}
          </div>

          {/* Table of Contents Sidebar */}
          <aside className="lg:col-span-4">
            <TableOfContents content={post.content} />
          </aside>
        </div>

        {/* Featured Restaurants - Inline Cards */}
        {post.restaurants && post.restaurants.length > 0 && (
          <div className="mb-12">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="mb-2 text-3xl font-bold">Featured in This Guide</h2>
                <p className="text-muted">
                  The {post.restaurants.length} restaurants you need to know
                </p>
              </div>
            </div>
            <div>
              {post.restaurants.map((restaurant, index) => (
                <InlineRestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  rank={index + 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* Author CTA - More prominent */}
        <div className="mb-8 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-gray-50 to-white p-8 shadow-lg">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="relative">
              <Image
                src={user.avatar}
                alt={user.displayName}
                width={100}
                height={100}
                className="rounded-full border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                <span className="text-lg">✓</span>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="mb-2 text-2xl font-bold">{user.displayName}</p>
              <p className="mb-2 font-semibold text-primary">{user.tastemakerProfile?.specialty}</p>
              <p className="mb-4 text-muted">{user.bio}</p>
              <div className="flex items-center justify-center gap-6 text-sm md:justify-start">
                <div>
                  <span className="text-lg font-bold text-primary">
                    {user.stats.followers.toLocaleString()}
                  </span>
                  <span className="ml-1 text-muted">followers</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-primary">
                    {user.tastemakerProfile?.totalPosts}
                  </span>
                  <span className="ml-1 text-muted">articles</span>
                </div>
              </div>
            </div>
            <Link
              href={`/tastemakers/${user.username}`}
              className="whitespace-nowrap rounded-xl bg-primary px-8 py-4 font-bold text-white transition-all hover:bg-primary/90 hover:shadow-xl"
            >
              Follow {user.displayName}
            </Link>
          </div>
        </div>

        {/* More from this author */}
        <div>
          <h2 className="mb-6 text-2xl font-bold">More from {user.displayName}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Placeholder for related posts */}
            <p className="col-span-2 text-muted">
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
