'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search } from 'lucide-react'
import { useTastemakerPosts } from '@/lib/hooks/use-tastemaker-posts'
import { useFeaturedLists } from '@/lib/hooks'
import { useCurrentUser } from '@/lib/hooks/use-user'
import { TastemakerPostCard } from '@/components/tastemakers/tastemaker-post-card'
import { CategoryPills } from '@/components/tastemakers/category-pills'
import { ContentModeToggle } from '@/components/tastemakers/content-mode-toggle'
import { FeaturedListRowWithProgress } from '@/components/lists/featured-list-row-with-progress'
import { FeaturedListCardWithProgress } from '@/components/lists/featured-list-card-with-progress'

// Desktop-only layout component
function DesktopLayout() {
  const [mode, setMode] = useState<'lists' | 'articles'>('articles')

  const { data: user } = useCurrentUser()
  const { data: featuredLists } = useFeaturedLists()
  const { data: allPostsData } = useTastemakerPosts() // Fetch all posts once

  // Memoize filtered and sliced posts
  const featuredPosts = useMemo(
    () => allPostsData?.filter(p => p.isFeatured).slice(0, 3) || [],
    [allPostsData]
  )
  const allPosts = useMemo(
    () => allPostsData?.slice(0, 6) || [],
    [allPostsData]
  )

  // Get the hero post (first featured post)
  const heroPost = featuredPosts[0]
  const otherFeaturedPosts = featuredPosts.slice(1)

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-3">Tastemakers</h1>
        <p className="text-lg text-muted max-w-2xl mx-auto mb-6">
          {mode === 'lists'
            ? 'Curated restaurant collections from NYC\'s top food experts'
            : 'Discover curated guides and insider tips from NYC\'s most influential food experts'
          }
        </p>

        {/* Toggle */}
        <div className="max-w-md mx-auto">
          <ContentModeToggle mode={mode} onModeChange={setMode} />
        </div>
      </div>

      {/* Content Area - Conditional based on mode */}
      {mode === 'lists' ? (
        // Featured Lists Mode
        <div>
          {featuredLists && featuredLists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredLists.map((list) => (
                <FeaturedListCardWithProgress
                  key={list.id}
                  list={list}
                  userId={user?.id || ''}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
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
          <div className="relative h-[500px] rounded-2xl overflow-hidden mb-8 group cursor-pointer shadow-xl hover:shadow-2xl transition-shadow">
            <a href={`/tastemakers/posts/${heroPost.id}`} className="block h-full">
              <div className="relative h-full">
                <img
                  src={heroPost.coverImage}
                  alt={heroPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                  <div className="max-w-4xl">
                    {/* Featured badge */}
                    <div className="inline-flex items-center gap-2 bg-primary px-4 py-2 rounded-full text-sm font-bold mb-4">
                      <span>⭐</span>
                      <span>Featured Article</span>
                    </div>

                    {/* Title and subtitle */}
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight drop-shadow-lg">
                      {heroPost.title}
                    </h2>
                    {heroPost.subtitle && (
                      <p className="text-lg md:text-xl mb-6 opacity-95 drop-shadow-md max-w-3xl">
                        {heroPost.subtitle}
                      </p>
                    )}

                    {/* Author and meta */}
                    <div className="flex items-center gap-4 flex-wrap">
                      {heroPost.user && (
                        <div className="flex items-center gap-3">
                          <img
                            src={heroPost.user.avatar}
                            alt={heroPost.user.displayName}
                            className="w-12 h-12 rounded-full border-2 border-white shadow-md"
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
                      <div className="flex gap-2 ml-auto">
                        {heroPost.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {otherFeaturedPosts.map((post) => (
              <TastemakerPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Category Navigation - Static for desktop */}
      <div className="mb-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <button className="px-4 py-2 bg-primary text-white rounded-full font-medium whitespace-nowrap hover:bg-primary/90 transition-colors">
            All
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium whitespace-nowrap hover:bg-gray-200 transition-colors">
            🍕 Pizza
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium whitespace-nowrap hover:bg-gray-200 transition-colors">
            ⭐ Fine Dining
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium whitespace-nowrap hover:bg-gray-200 transition-colors">
            💰 Budget Eats
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium whitespace-nowrap hover:bg-gray-200 transition-colors">
            🌱 Vegan
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium whitespace-nowrap hover:bg-gray-200 transition-colors">
            🍜 Ramen
          </button>
        </div>
      </div>

      {/* Recent Articles Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest Articles</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPosts.map((post) => (
            <TastemakerPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
        </div>
      )}
    </div>
  )
}

// Mobile-only layout component
function MobileLayout() {
  const [mode, setMode] = useState<'lists' | 'articles'>('lists')
  const [category, setCategory] = useState('All')

  const { data: user } = useCurrentUser()
  const { data: posts } = useTastemakerPosts()
  const { data: featuredLists } = useFeaturedLists()

  // Filter posts by category
  const filteredPosts = category === 'All'
    ? posts
    : posts?.filter(p => p.tags.includes(category))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar - Placeholder */}
      <div className="bg-white px-4 pt-4 pb-2">
        <button
          onClick={() => alert('Search coming soon!')}
          className="w-full bg-gray-100 rounded-xl flex items-center px-4 py-3"
        >
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <span className="text-base text-gray-500">Search tastemakers...</span>
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
          <CategoryPills
            selectedCategory={category}
            onCategorySelect={setCategory}
          />

          {/* Articles Grid */}
          <div className="px-4 pb-4 space-y-4">
            {filteredPosts && filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <TastemakerPostCard
                  key={post.id}
                  post={post}
                  variant="compact"
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No articles found for this category
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
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
  )
}
