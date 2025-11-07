'use client';

import { Search } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

import { FeaturedListCardWithProgress } from '@/components/lists/featured-list-card-with-progress';
import { FeaturedListRowWithProgress } from '@/components/lists/featured-list-row-with-progress';
import { CategoryPills } from '@/components/tastemakers/category-pills';
import { ContentModeToggle } from '@/components/tastemakers/content-mode-toggle';
import { TastemakerPostCard } from '@/components/tastemakers/tastemaker-post-card';
import { useFeaturedLists } from '@/lib/hooks';
import { useTastemakerPosts } from '@/lib/hooks/use-tastemaker-posts';
import { useCurrentUser } from '@/lib/hooks/use-user';

// Desktop-only layout component
const DesktopLayout = () => {
  const [mode, setMode] = useState<'lists' | 'articles'>('articles');

  const { data: user } = useCurrentUser();
  const { data: featuredLists } = useFeaturedLists();
  const { data: allPostsData } = useTastemakerPosts(); // Fetch all posts once

  // Memoize filtered and sliced posts
  const featuredPosts = useMemo(
    () => allPostsData?.filter((p) => p.isFeatured).slice(0, 3) || [],
    [allPostsData]
  );
  const allPosts = useMemo(() => allPostsData?.slice(0, 6) || [], [allPostsData]);

  // Get the hero post (first featured post)
  const heroPost = featuredPosts[0];
  const otherFeaturedPosts = featuredPosts.slice(1);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-3 text-5xl font-bold">Tastemakers</h1>
        <p className="mx-auto mb-6 max-w-2xl text-lg text-muted">
          {mode === 'lists'
            ? "Curated restaurant collections from NYC's top food experts"
            : "Discover curated guides and insider tips from NYC's most influential food experts"}
        </p>

        {/* Toggle */}
        <div className="mx-auto max-w-md">
          <ContentModeToggle mode={mode} onModeChange={setMode} />
        </div>
      </div>

      {/* Content Area - Conditional based on mode */}
      {mode === 'lists' ? (
        // Featured Lists Mode
        <div>
          {featuredLists && featuredLists.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredLists.map((list) => (
                <FeaturedListCardWithProgress key={list.id} list={list} userId={user?.id || ''} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-700">
              <p>No featured lists available</p>
            </div>
          )}
        </div>
      ) : (
        // Articles Mode - Magazine Style
        <div>
          {/* Hero Section - Magazine Style */}
          <div className="mb-12">
            {/* Hero Featured Post - Full Width */}
            {heroPost && (
              <div className="group relative mb-8 h-[500px] cursor-pointer overflow-hidden rounded-2xl shadow-xl transition-shadow hover:shadow-2xl">
                <a href={`/tastemakers/posts/${heroPost.id}`} className="block h-full">
                  <div className="relative h-full">
                    <img
                      src={heroPost.coverImage}
                      alt={heroPost.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white md:p-12">
                      <div className="max-w-4xl">
                        {/* Featured badge */}
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold">
                          <span>⭐</span>
                          <span>Featured Article</span>
                        </div>

                        {/* Title and subtitle */}
                        <h2 className="mb-4 text-4xl font-bold leading-tight drop-shadow-lg md:text-5xl">
                          {heroPost.title}
                        </h2>
                        {heroPost.subtitle && (
                          <p className="mb-6 max-w-3xl text-lg opacity-95 drop-shadow-md md:text-xl">
                            {heroPost.subtitle}
                          </p>
                        )}

                        {/* Author and meta */}
                        <div className="flex flex-wrap items-center gap-4">
                          {heroPost.user && (
                            <div className="flex items-center gap-3">
                              <img
                                src={heroPost.user.avatar}
                                alt={heroPost.user.displayName}
                                className="h-12 w-12 rounded-full border-2 border-white shadow-md"
                              />
                              <div>
                                <p className="font-semibold">{heroPost.user.displayName}</p>
                                <p className="text-sm opacity-90">
                                  {heroPost.publishedAt.toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Tags */}
                          <div className="ml-auto flex gap-2">
                            {heroPost.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            )}

            {/* Two Featured Posts Side by Side */}
            {otherFeaturedPosts.length > 0 && (
              <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
                {otherFeaturedPosts.map((post) => (
                  <TastemakerPostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Category Navigation - Static for desktop */}
          <div className="mb-8">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <button className="whitespace-nowrap rounded-full bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary/90">
                All
              </button>
              <button className="whitespace-nowrap rounded-full bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200">
                🍕 Pizza
              </button>
              <button className="whitespace-nowrap rounded-full bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200">
                ⭐ Fine Dining
              </button>
              <button className="whitespace-nowrap rounded-full bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200">
                💰 Budget Eats
              </button>
              <button className="whitespace-nowrap rounded-full bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200">
                🌱 Vegan
              </button>
              <button className="whitespace-nowrap rounded-full bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200">
                🍜 Ramen
              </button>
            </div>
          </div>

          {/* Recent Articles Section */}
          <div className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Latest Articles</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allPosts.map((post) => (
                <TastemakerPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mobile-only layout component
const MobileLayout = () => {
  const [mode, setMode] = useState<'lists' | 'articles'>('lists');
  const [category, setCategory] = useState('All');

  const { data: user } = useCurrentUser();
  const { data: posts } = useTastemakerPosts();
  const { data: featuredLists } = useFeaturedLists();

  // Filter posts by category
  const filteredPosts =
    category === 'All' ? posts : posts?.filter((p) => p.tags.includes(category));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => window.history.back()}
            className="-ml-2 rounded-lg p-2 transition-colors hover:bg-gray-100"
            aria-label="Go back"
          >
            <svg
              className="h-7 w-7 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Tastemakers</h1>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Search Bar - Placeholder */}
      <div className="bg-white px-4 pb-2">
        <button
          onClick={() => alert('Search coming soon!')}
          className="flex w-full items-center rounded-xl bg-gray-100 px-4 py-3"
        >
          <Search className="mr-2 h-5 w-5 text-gray-800" />
          <span className="text-base text-gray-700">Search</span>
        </button>
      </div>

      {/* Toggle Control */}
      <ContentModeToggle mode={mode} onModeChange={setMode} />

      {/* Content Area */}
      {mode === 'lists' ? (
        // Featured Lists Mode
        <div className="bg-white">
          {featuredLists?.map((list, index) => (
            <FeaturedListRowWithProgress
              key={list.id}
              list={list}
              userId={user?.id || ''}
              isLast={index === (featuredLists?.length || 0) - 1}
            />
          ))}
        </div>
      ) : (
        // Tastemaker Articles Mode
        <div>
          {/* Category Pills */}
          <CategoryPills selectedCategory={category} onCategorySelect={setCategory} />

          {/* Articles Grid */}
          <div className="space-y-4 px-4 pb-4">
            {filteredPosts && filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <TastemakerPostCard key={post.id} post={post} variant="compact" />
              ))
            ) : (
              <div className="py-12 text-center text-gray-700">
                No articles found for this category
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Main page component with responsive switching
export default function TastemakersPage() {
  return (
    <>
      {/* Mobile Layout - visible only on mobile */}
      <div className="md:hidden">
        <MobileLayout />
      </div>

      {/* Desktop Layout - visible only on desktop */}
      <div className="hidden md:block">
        <DesktopLayout />
      </div>
    </>
  );
}
