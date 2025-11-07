'use client';

import { Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCallback } from 'react';

import { FeaturedListCardWithProgress } from '@/components/lists/featured-list-card-with-progress';
import { FeaturedListRowWithProgress } from '@/components/lists/featured-list-row-with-progress';
import { CategoryPills } from '@/components/tastemakers/category-pills';
import { ContentModeToggle } from '@/components/tastemakers/content-mode-toggle';
import { TastemakerPostCard } from '@/components/tastemakers/tastemaker-post-card';
import { TutorialBanner } from '@/components/tutorial/tutorial-banner';
import { TutorialOverlay } from '@/components/tutorial/tutorial-overlay';
import { useTastemakersTutorial } from '@/lib/hooks/use-tastemakers-tutorial';

export default function TastemakersTutorialPage() {
  const {
    mode,
    category,
    user,
    featuredLists,
    featuredPosts,
    allPosts,
    filteredPosts,
    heroPost,
    otherFeaturedPosts,
    setMode,
    setCategory,
    handleBack,
    handleNext,
  } = useTastemakersTutorial();

  const handleSearchClick = useCallback(() => {
    alert('Search coming soon!');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-4">
      {/* Tutorial Banner */}
      <TutorialBanner
        featureName="Tastemakers"
        description="Follow NYC's top food experts with verified expertise and curated content"
      />

      {/* Mobile Header */}
      <div className="border-b border-gray-200 bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="-ml-2 rounded-lg p-2 transition-colors hover:bg-gray-100"
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6 text-gray-900" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Tastemakers</h1>
          <div className="w-9" />
        </div>

        {/* Mobile Search Bar */}
        <div className="px-4 pb-2">
          <button
            onClick={handleSearchClick}
            className="flex w-full items-center rounded-xl bg-gray-100 px-4 py-3"
            aria-label="Search tastemakers and articles"
          >
            <Search className="mr-2 h-5 w-5 text-gray-800" aria-hidden="true" />
            <span className="text-base text-gray-700">Search</span>
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="container mx-auto hidden px-4 py-6 md:block">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-5xl font-bold">Tastemakers</h1>
          <p className="mx-auto mb-6 max-w-2xl text-lg text-muted">
            {mode === 'lists'
              ? "Curated restaurant collections from NYC's top food experts"
              : "Discover curated guides and insider tips from NYC's most influential food experts"}
          </p>

          <div className="mx-auto max-w-md">
            <ContentModeToggle mode={mode} onModeChange={setMode} />
          </div>
        </div>
      </div>

      {/* Mobile Toggle */}
      <div className="md:hidden">
        <ContentModeToggle mode={mode} onModeChange={setMode} />
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-0 md:px-4">
        {mode === 'lists' ? (
          // Lists Mode
          <div>
            {/* Desktop Grid */}
            <div className="hidden grid-cols-1 gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
              {featuredLists && featuredLists.length > 0 ? (
                featuredLists.map((list) => (
                  <FeaturedListCardWithProgress key={list.id} list={list} userId={user?.id || ''} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-gray-700">
                  <p>No featured lists available</p>
                </div>
              )}
            </div>

            {/* Mobile List */}
            <div className="bg-white md:hidden">
              {featuredLists?.map((list, index) => (
                <FeaturedListRowWithProgress
                  key={list.id}
                  list={list}
                  userId={user?.id || ''}
                  isLast={index === (featuredLists?.length || 0) - 1}
                />
              ))}
            </div>
          </div>
        ) : (
          // Articles Mode
          <div>
            {/* Desktop Featured Hero */}
            <div className="mb-12 hidden md:block">
              {heroPost && (
                <div className="group relative mb-8 h-[500px] cursor-pointer overflow-hidden rounded-2xl shadow-xl transition-shadow hover:shadow-2xl">
                  <Link href={`/tastemakers/posts/${heroPost.id}`} className="block h-full">
                    <div className="relative h-full">
                      <img
                        src={heroPost.coverImage}
                        alt={heroPost.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-8 text-white md:p-12">
                        <div className="max-w-4xl">
                          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold">
                            <span>⭐</span>
                            <span>Featured Article</span>
                          </div>
                          <h2 className="mb-4 text-4xl font-bold leading-tight drop-shadow-lg md:text-5xl">
                            {heroPost.title}
                          </h2>
                          {heroPost.subtitle && (
                            <p className="mb-6 text-lg text-white/90 drop-shadow md:text-xl">
                              {heroPost.subtitle}
                            </p>
                          )}
                          <div className="flex items-center gap-6 text-sm text-white/80">
                            {heroPost.user && (
                              <div className="flex items-center gap-2">
                                <img
                                  src={heroPost.user.avatar}
                                  alt={heroPost.user.displayName}
                                  className="h-8 w-8 rounded-full"
                                />
                                <span className="font-semibold">{heroPost.user.displayName}</span>
                              </div>
                            )}
                            <span>
                              {new Date(heroPost.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                            <div className="flex gap-2">
                              {heroPost.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="rounded bg-white/20 px-2 py-1 text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Desktop Other Featured Posts */}
              {otherFeaturedPosts.length > 0 && (
                <div className="mb-12 grid grid-cols-2 gap-6">
                  {otherFeaturedPosts.map((post) => (
                    <TastemakerPostCard key={post.id} post={post} variant="default" />
                  ))}
                </div>
              )}

              {/* Desktop More Articles Section */}
              <div className="mb-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">More Articles</h2>
                </div>

                {/* Category Pills */}
                <CategoryPills selectedCategory={category} onCategorySelect={setCategory} />

                {/* Articles Grid */}
                <div className="mt-6 grid grid-cols-2 gap-6">
                  {allPosts.length > 0 ? (
                    allPosts.map((post) => (
                      <TastemakerPostCard key={post.id} post={post} variant="compact" />
                    ))
                  ) : (
                    <div className="col-span-2 py-12 text-center text-gray-700">
                      No articles available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Articles */}
            <div className="md:hidden">
              <CategoryPills selectedCategory={category} onCategorySelect={setCategory} />
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
          </div>
        )}
      </div>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        currentStep={3}
        totalSteps={3}
        featureName="Tastemakers"
        onBack={handleBack}
        onNext={handleNext}
      />
    </div>
  );
}
