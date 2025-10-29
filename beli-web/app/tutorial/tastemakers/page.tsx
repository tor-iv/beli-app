'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useTastemakerPosts } from '@/lib/hooks/use-tastemaker-posts'
import { useFeaturedLists } from '@/lib/hooks'
import { useCurrentUser } from '@/lib/hooks/use-user'
import { TastemakerPostCard } from '@/components/tastemakers/tastemaker-post-card'
import { CategoryPills } from '@/components/tastemakers/category-pills'
import { ContentModeToggle } from '@/components/tastemakers/content-mode-toggle'
import { FeaturedListRowWithProgress } from '@/components/lists/featured-list-row-with-progress'
import { FeaturedListCardWithProgress } from '@/components/lists/featured-list-card-with-progress'
import { TutorialOverlay } from '@/components/tutorial/tutorial-overlay'
import { TutorialBanner } from '@/components/tutorial/tutorial-banner'

// Desktop-only layout component
function DesktopLayout({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const [mode, setMode] = useState<'lists' | 'articles'>('articles')

  const { data: user } = useCurrentUser()
  const { data: featuredLists } = useFeaturedLists()
  const { data: allPostsData } = useTastemakerPosts()

  const featuredPosts = useMemo(
    () => allPostsData?.filter(p => p.isFeatured).slice(0, 3) || [],
    [allPostsData]
  )
  const allPosts = useMemo(
    () => allPostsData?.slice(0, 6) || [],
    [allPostsData]
  )

  const heroPost = featuredPosts[0]
  const otherFeaturedPosts = featuredPosts.slice(1)

  return (
    <div className="pb-4">
      {/* Tutorial Banner */}
      <TutorialBanner
        featureName="Tastemakers"
        description="Follow NYC's top food experts with verified expertise and curated content"
      />

      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3">Tastemakers</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-6">
            {mode === 'lists'
              ? 'Curated restaurant collections from NYC\'s top food experts'
              : 'Discover curated guides and insider tips from NYC\'s most influential food experts'
            }
          </p>

          <div className="max-w-md mx-auto">
            <ContentModeToggle mode={mode} onModeChange={setMode} />
          </div>
        </div>

        {mode === 'lists' ? (
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
              <div className="text-center py-12 text-gray-700">
                <p>No featured lists available</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-12">
              {heroPost && (
                <div className="relative h-[500px] rounded-2xl overflow-hidden mb-8 group cursor-pointer shadow-xl hover:shadow-2xl transition-shadow">
                  <a href={`/tastemakers/posts/${heroPost.id}`} className="block h-full">
                    <div className="relative h-full">
                      <img
                        src={heroPost.coverImage}
                        alt={heroPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                        <div className="max-w-4xl">
                          <div className="inline-flex items-center gap-2 bg-primary px-4 py-2 rounded-full text-sm font-bold mb-4">
                            <span>⭐</span>
                            <span>Featured Article</span>
                          </div>
                          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight drop-shadow-lg">
                            {heroPost.title}
                          </h2>
                          {heroPost.subtitle && (
                            <p className="text-lg md:text-xl mb-6 opacity-95 drop-shadow-md max-w-3xl">
                              {heroPost.subtitle}
                            </p>
                          )}
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

              {otherFeaturedPosts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  {otherFeaturedPosts.map((post) => (
                    <TastemakerPostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>

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

      {/* Tutorial Overlay */}
      <TutorialOverlay
        currentStep={3}
        totalSteps={3}
        featureName="Tastemakers"
        onBack={onBack}
        onNext={onNext}
      />
    </div>
  )
}

// Mobile-only layout component
function MobileLayout({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const [mode, setMode] = useState<'lists' | 'articles'>('lists')
  const [category, setCategory] = useState('All')

  const { data: user } = useCurrentUser()
  const { data: posts } = useTastemakerPosts()
  const { data: featuredLists } = useFeaturedLists()

  const filteredPosts = category === 'All'
    ? posts
    : posts?.filter(p => p.tags.includes(category))

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Tutorial Banner */}
      <TutorialBanner
        featureName="Tastemakers"
        description="Follow NYC's top food experts"
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => window.history.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <svg
              className="w-7 h-7 text-gray-900"
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
          <div className="w-9" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 pb-2">
        <button
          onClick={() => alert('Search coming soon!')}
          className="w-full bg-gray-100 rounded-xl flex items-center px-4 py-3"
        >
          <Search className="w-5 h-5 text-gray-800 mr-2" />
          <span className="text-base text-gray-700">Search</span>
        </button>
      </div>

      {/* Toggle Control */}
      <ContentModeToggle mode={mode} onModeChange={setMode} />

      {/* Content Area */}
      {mode === 'lists' ? (
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
        <div>
          <CategoryPills
            selectedCategory={category}
            onCategorySelect={setCategory}
          />
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
              <div className="text-center py-12 text-gray-700">
                No articles found for this category
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tutorial Overlay */}
      <TutorialOverlay
        currentStep={3}
        totalSteps={3}
        featureName="Tastemakers"
        onBack={onBack}
        onNext={onNext}
      />
    </div>
  )
}

// Main page component with responsive switching
export default function TastemakersTutorialPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push('/tutorial/what-to-order')
  }

  const handleNext = () => {
    router.push('/feed')
  }

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden">
        <MobileLayout onBack={handleBack} onNext={handleNext} />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <DesktopLayout onBack={handleBack} onNext={handleNext} />
      </div>
    </>
  )
}
