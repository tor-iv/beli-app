import { MockDataService } from '@/lib/mockDataService';
import { TastemakerCard } from '@/components/tastemakers/tastemaker-card';
import { TastemakerPostCard } from '@/components/tastemakers/tastemaker-post-card';

export default async function TastemakersPage() {
  // Server-side data fetching
  const tastemakers = await MockDataService.getTastemakers();
  const featuredPosts = await MockDataService.getFeaturedTastemakerPosts(3);
  const allPosts = await MockDataService.getTastemakerPosts(6);

  // Get the hero post (first featured post)
  const heroPost = featuredPosts[0];
  const otherFeaturedPosts = featuredPosts.slice(1);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section - Magazine Style */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3">Tastemakers</h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Discover curated guides and insider tips from NYC's most influential food experts
          </p>
        </div>

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

      {/* Category Navigation */}
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

      {/* Top Tastemakers Section - Highlighted */}
      <div className="mb-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Meet the Tastemakers</h2>
            <p className="text-muted">NYC's most trusted food experts</p>
          </div>
        </div>

        {/* Top 3 in larger cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {tastemakers.slice(0, 3).map((tastemaker, index) => (
            <div key={tastemaker.id} className="relative">
              {index === 0 && (
                <div className="absolute -top-2 -left-2 bg-yellow-400 text-yellow-900 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg z-10">
                  #1
                </div>
              )}
              <TastemakerCard tastemaker={tastemaker} />
            </div>
          ))}
        </div>

        {/* Rest in regular grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tastemakers.slice(3).map((tastemaker) => (
            <TastemakerCard key={tastemaker.id} tastemaker={tastemaker} />
          ))}
        </div>
      </div>
    </div>
  );
}
