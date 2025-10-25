import { MockDataService } from '@/lib/mockDataService';
import { TastemakerCard } from '@/components/tastemakers/tastemaker-card';
import { TastemakerPostCard } from '@/components/tastemakers/tastemaker-post-card';

export default async function TastemakersPage() {
  // Server-side data fetching
  const tastemakers = await MockDataService.getTastemakers();
  const featuredPosts = await MockDataService.getFeaturedTastemakerPosts(3);
  const allPosts = await MockDataService.getTastemakerPosts(6);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Tastemakers</h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Discover curated guides and insider tips from NYC's most influential food experts.
          From pizza specialists to Michelin hunters, get the inside scoop on where to eat.
        </p>
      </div>

      {/* Featured Posts Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Articles</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPosts.map((post) => (
            <TastemakerPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      {/* Top Tastemakers Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Top Tastemakers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tastemakers.slice(0, 6).map((tastemaker) => (
            <TastemakerCard key={tastemaker.id} tastemaker={tastemaker} />
          ))}
        </div>
      </div>

      {/* Recent Articles Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Articles</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPosts.map((post) => (
            <TastemakerPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      {/* All Tastemakers Section */}
      {tastemakers.length > 6 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">All Tastemakers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tastemakers.slice(6).map((tastemaker) => (
              <TastemakerCard key={tastemaker.id} tastemaker={tastemaker} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
