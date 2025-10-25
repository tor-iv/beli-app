import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MockDataService } from '@/lib/mockDataService';
import { TastemakerPostCard } from '@/components/tastemakers/tastemaker-post-card';
import { RestaurantListItemCompact } from '@/components/restaurant/restaurant-list-item-compact';
import { IoCheckmarkCircle, IoLogoInstagram, IoLogoTwitter, IoGlobe } from 'react-icons/io5';

interface PageProps {
  params: { username: string };
}

export default async function TastemakerProfilePage({ params }: PageProps) {
  const { username } = params;

  // Fetch tastemaker data
  const tastemaker = await MockDataService.getTastemakerByUsername(username);
  if (!tastemaker || !tastemaker.tastemakerProfile) {
    notFound();
  }

  const profile = tastemaker.tastemakerProfile;
  const posts = await MockDataService.getTastemakerPostsByUser(tastemaker.id);
  const lists = await MockDataService.getUserLists(tastemaker.id);
  const publicLists = lists.filter(list => list.isPublic);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-6">
          {/* Avatar */}
          <div className="relative">
            <Image
              src={tastemaker.avatar}
              alt={tastemaker.displayName}
              width={120}
              height={120}
              className="rounded-full"
            />
            <IoCheckmarkCircle
              className="absolute -bottom-2 -right-2 text-primary bg-white rounded-full"
              size={32}
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{tastemaker.displayName}</h1>
            <p className="text-muted mb-3">@{tastemaker.username}</p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.badges.map((badge) => (
                <span
                  key={badge.type}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${badge.color}15`,
                    color: badge.color,
                  }}
                >
                  {badge.icon && <span className="text-base">{badge.icon}</span>}
                  {badge.label}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-6 mb-4">
              <div>
                <span className="font-bold text-lg">{tastemaker.stats.followers.toLocaleString()}</span>
                <span className="text-muted ml-1">followers</span>
              </div>
              <div>
                <span className="font-bold text-lg">{tastemaker.stats.following.toLocaleString()}</span>
                <span className="text-muted ml-1">following</span>
              </div>
              <div>
                <span className="font-bold text-lg">{profile.totalPosts}</span>
                <span className="text-muted ml-1">posts</span>
              </div>
              <div>
                <span className="font-bold text-lg">{profile.featuredListsCount}</span>
                <span className="text-muted ml-1">lists</span>
              </div>
            </div>

            {/* Follow button placeholder */}
            <button className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Follow
            </button>
          </div>
        </div>

        {/* Specialty and Tagline */}
        <div className="mb-6">
          <p className="text-xl font-semibold mb-2">{profile.specialty}</p>
          <p className="text-lg text-muted mb-4">{profile.tagline}</p>
          <p className="text-muted">{tastemaker.bio}</p>
        </div>

        {/* Social Links */}
        {profile.socialLinks && (
          <div className="flex gap-4">
            {profile.socialLinks.instagram && (
              <a
                href={`https://instagram.com/${profile.socialLinks.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted hover:text-primary transition-colors"
              >
                <IoLogoInstagram size={20} />
                <span className="text-sm">{profile.socialLinks.instagram}</span>
              </a>
            )}
            {profile.socialLinks.twitter && (
              <a
                href={`https://twitter.com/${profile.socialLinks.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted hover:text-primary transition-colors"
              >
                <IoLogoTwitter size={20} />
                <span className="text-sm">{profile.socialLinks.twitter}</span>
              </a>
            )}
            {profile.socialLinks.website && (
              <a
                href={`https://${profile.socialLinks.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted hover:text-primary transition-colors"
              >
                <IoGlobe size={20} />
                <span className="text-sm">{profile.socialLinks.website}</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Content Sections */}
      <div className="max-w-6xl mx-auto">
        {/* Posts Section */}
        {posts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Articles & Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <TastemakerPostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        {/* Featured Lists Section */}
        {publicLists.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Lists</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {publicLists.map((list) => (
                <div key={list.id} className="beli-card p-6">
                  <Link href={`/lists/${list.id}`}>
                    <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
                      {list.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted mb-3">{list.description}</p>
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <span>{list.restaurants.length} restaurants</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Rated Restaurants */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Top Rated Spots</h2>
          <div className="space-y-4">
            {/* This would show their highest rated restaurants - placeholder for now */}
            <p className="text-muted">Check out their lists and articles to see their favorite spots!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
