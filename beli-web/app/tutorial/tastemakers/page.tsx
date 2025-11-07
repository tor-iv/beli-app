'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ArrowLeft } from 'lucide-react'
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

export default function TastemakersTutorialPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'lists' | 'articles'>('articles')
  const [category, setCategory] = useState('All')

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

  const filteredPosts = useMemo(
    () => category === 'All' ? allPosts : allPosts.filter(p => p.tags.includes(category)),
    [allPosts, category]
  )

  const heroPost = featuredPosts[0]
  const otherFeaturedPosts = featuredPosts.slice(1)

  const handleBack = () => {
    router.push('/tutorial/what-to-order')
  }

  const handleNext = () => {
    router.push('/feed')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 md:pb-4">
      {/* Tutorial Banner */}
      <TutorialBanner
        featureName="Tastemakers"
        description="Follow NYC's top food experts with verified expertise and curated content"
      />

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Tastemakers</h1>
          <div className="w-9" />
        </div>

        {/* Mobile Search Bar */}
        <div className="px-4 pb-2">
          <button
            onClick={() => alert('Search coming soon!')}
            className="w-full bg-gray-100 rounded-xl flex items-center px-4 py-3"
            aria-label="Search tastemakers and articles"
          >
            <Search className="w-5 h-5 text-gray-800 mr-2" aria-hidden="true" />
            <span className="text-base text-gray-700">Search</span>
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3">Tastemakers</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-6">
            {mode === 'lists'
              ? "Curated restaurant collections from NYC's top food experts"
              : "Discover curated guides and insider tips from NYC's most influential food experts"
            }
          </p>

          <div className="max-w-md mx-auto">
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
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredLists && featuredLists.length > 0 ? (
                featuredLists.map((list) => (
                  <FeaturedListCardWithProgress
                    key={list.id}
                    list={list}
                    userId={user?.id || ''}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-700">
                  <p>No featured lists available</p>
                </div>
              )}
            </div>

            {/* Mobile List */}
            <div className="md:hidden bg-white">
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
            <div className="hidden md:block mb-12">
              {heroPost && (
                <div className="relative h-[500px] rounded-2xl overflow-hidden mb-8 group cursor-pointer shadow-xl hover:shadow-2xl transition-shadow">
                  <Link href={`/tastemakers/posts/${heroPost.id}`} className="block h-full">
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
                            <p className="text-lg md:text-xl text-white/90 mb-6 drop-shadow">
                              {heroPost.subtitle}
                            </p>
                          )}
                          <div className="flex items-center gap-6 text-sm text-white/80">
                            {heroPost.user && (
                              <div className="flex items-center gap-2">
                                <img
                                  src={heroPost.user.avatar}
                                  alt={heroPost.user.displayName}
                                  className="w-8 h-8 rounded-full"
                                />
                                <span className="font-semibold">
                                  {heroPost.user.displayName}
                                </span>
                              </div>
                            )}
                            <span>{new Date(heroPost.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <div className="flex gap-2">
                              {heroPost.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="px-2 py-1 bg-white/20 rounded text-xs">
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
                <div className="grid grid-cols-2 gap-6 mb-12">
                  {otherFeaturedPosts.map((post) => (
                    <TastemakerPostCard
                      key={post.id}
                      post={post}
                      variant="default"
                    />
                  ))}
                </div>
              )}

              {/* Desktop More Articles Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">More Articles</h2>
                </div>

                {/* Category Pills */}
                <CategoryPills
                  selectedCategory={category}
                  onCategorySelect={setCategory}
                />

                {/* Articles Grid */}
                <div className="grid grid-cols-2 gap-6 mt-6">
                  {allPosts.length > 0 ? (
                    allPosts.map((post) => (
                      <TastemakerPostCard
                        key={post.id}
                        post={post}
                        variant="compact"
                      />
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12 text-gray-700">
                      No articles available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Articles */}
            <div className="md:hidden">
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
  )
}
