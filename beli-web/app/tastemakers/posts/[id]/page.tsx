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
      <article className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/tastemakers" className="text-primary hover:underline text-sm font-medium">
            ← Back to Tastemakers
          </Link>
        </div>

        {/* Cover Image - Full width hero */}
        <div className="relative w-full h-[500px] md:h-[600px] mb-8 rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Title overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight drop-shadow-lg max-w-4xl">
              {post.title}
            </h1>

            {/* Subtitle */}
            {post.subtitle && (
              <p className="text-lg md:text-2xl mb-6 opacity-95 drop-shadow-md max-w-3xl">
                {post.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Meta bar */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-6 border-b">
          {/* Author info */}
          <Link
            href={`/tastemakers/${user.username}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Image
              src={user.avatar}
              alt={user.displayName}
              width={56}
              height={56}
              className="rounded-full border-2 border-primary"
            />
            <div>
              <p className="font-bold text-lg">{user.displayName}</p>
              <p className="text-sm text-primary font-medium">{user.tastemakerProfile?.specialty}</p>
              <p className="text-xs text-muted">
                {post.publishedAt.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })} · {Math.ceil(post.content.split(' ').length / 200)} min read
              </p>
            </div>
          </Link>

          {/* Engagement stats - Larger */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
                <IoEye size={20} />
                <span className="font-bold text-lg">{post.interactions.views.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted">Views</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-rose-500 mb-1">
                <IoHeart size={20} />
                <span className="font-bold text-lg">{post.interactions.likes.length}</span>
              </div>
              <p className="text-xs text-muted">Likes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-amber-500 mb-1">
                <IoBookmark size={20} />
                <span className="font-bold text-lg">{post.interactions.bookmarks.length}</span>
              </div>
              <p className="text-xs text-muted">Saves</p>
            </div>
          </div>
        </div>

        {/* Action Buttons - More prominent */}
        <div className="flex items-center gap-3 mb-10">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors font-medium shadow-sm">
            <IoHeartOutline size={22} />
            <span>Like Article</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors font-medium shadow-sm">
            <IoBookmarkOutline size={22} />
            <span>Save</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium shadow-sm">
            <IoShareSocial size={22} />
            <span>Share</span>
          </button>
        </div>

        {/* Content - Better typography */}
        <div className="prose prose-lg max-w-none mb-12">
          {/* Render content with line breaks preserved */}
          {post.content.split('\n').map((paragraph, index) => {
            // Handle headers (lines starting with **)
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              const text = paragraph.replace(/\*\*/g, '');
              return (
                <h2 key={index} className="text-3xl font-bold mt-10 mb-5 text-gray-900">
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
              <p key={index} className="mb-5 text-gray-700 leading-relaxed text-lg">
                {parts.map((part, partIndex) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={partIndex} className="font-bold text-gray-900">{part.replace(/\*\*/g, '')}</strong>;
                  }
                  return part;
                })}
              </p>
            );
          })}
        </div>

        {/* Featured Restaurants - Enhanced */}
        {post.restaurants && post.restaurants.length > 0 && (
          <div className="mb-12 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Restaurants</h2>
                <p className="text-muted">Places mentioned in this article</p>
              </div>
              <span className="bg-primary text-white px-4 py-2 rounded-full font-bold text-sm">
                {post.restaurants.length} spots
              </span>
            </div>
            <div className="space-y-4">
              {post.restaurants.map((restaurant) => (
                <RestaurantListItemCompact key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </div>
        )}

        {/* Author CTA - More prominent */}
        <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-primary/20 rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Image
                src={user.avatar}
                alt={user.displayName}
                width={100}
                height={100}
                className="rounded-full border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center">
                <span className="text-lg">✓</span>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-2xl font-bold mb-2">{user.displayName}</p>
              <p className="text-primary font-semibold mb-2">{user.tastemakerProfile?.specialty}</p>
              <p className="text-muted mb-4">{user.bio}</p>
              <div className="flex items-center justify-center md:justify-start gap-6 text-sm">
                <div>
                  <span className="font-bold text-lg text-primary">{user.stats.followers.toLocaleString()}</span>
                  <span className="text-muted ml-1">followers</span>
                </div>
                <div>
                  <span className="font-bold text-lg text-primary">{user.tastemakerProfile?.totalPosts}</span>
                  <span className="text-muted ml-1">articles</span>
                </div>
              </div>
            </div>
            <Link
              href={`/tastemakers/${user.username}`}
              className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all hover:shadow-xl whitespace-nowrap"
            >
              Follow {user.displayName}
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
