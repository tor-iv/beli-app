'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Share2, Bookmark, List as ListIcon, MapPin } from 'lucide-react'
import { MockDataService } from '@/lib/mockDataService'
import { useCurrentUser } from '@/lib/hooks/use-user'
import { List, Restaurant } from '@/types'
import { RestaurantCard } from '@/components/restaurant/restaurant-card'

export default function FeaturedListDetailPage() {
  const params = useParams()
  const router = useRouter()
  const listId = params.id as string

  const { data: user } = useCurrentUser()
  const [list, setList] = useState<List | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [userProgress, setUserProgress] = useState({ visited: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  const loadListDetails = useCallback(async () => {
    try {
      const listData = await MockDataService.getListById(listId)
      if (!listData) {
        router.push('/tastemakers')
        return
      }

      setList(listData)

      // Load restaurants in the list
      const restaurantData = await Promise.all(
        listData.restaurants.map((id) => MockDataService.getRestaurantById(id))
      )
      const validRestaurants = restaurantData.filter((r): r is Restaurant => r !== null)
      setRestaurants(validRestaurants)

      // Load user progress
      if (user) {
        const progress = await MockDataService.getUserListProgress(user.id, listId)
        setUserProgress(progress)
      }
    } catch (error) {
      console.error('Failed to load list details:', error)
    } finally {
      setLoading(false)
    }
  }, [listId, router, user])

  useEffect(() => {
    loadListDetails()
  }, [loadListDetails])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: list?.name,
          text: list?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!list) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">List not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px]">
        <img
          src={list.thumbnailImage || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=500&fit=crop'}
          alt={list.name}
          className="w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Header Buttons */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between safe-area-top">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            {list.name}
          </h1>
        </div>
      </div>

      {/* List/Map Toggle - Centered below hero */}
      <div className="bg-white px-4 pt-4 pb-3">
        <div className="max-w-xs mx-auto">
          <div className="bg-gray-100 rounded-full p-1 flex">
            <button
              onClick={() => setViewMode('list')}
              className={`
                flex-1 px-4 py-2 rounded-full flex items-center justify-center gap-2 transition-colors font-medium text-sm
                ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-600'}
              `}
            >
              <ListIcon className="w-4 h-4" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`
                flex-1 px-4 py-2 rounded-full flex items-center justify-center gap-2 transition-colors font-medium text-sm
                ${viewMode === 'map' ? 'bg-primary text-white' : 'text-gray-600'}
              `}
            >
              <MapPin className="w-4 h-4" />
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white px-4 pb-4 flex gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium">
          <Bookmark className="w-5 h-5" />
          <span>Bookmark all</span>
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>

      {/* Description */}
      <div className="bg-white px-6 py-5 mb-6">
        <p className="text-gray-700 leading-relaxed mb-3">{list.description}</p>
        <p className="text-sm text-gray-600 font-medium">
          You've been to {userProgress.visited} of {userProgress.total}
        </p>
      </div>

      {/* Restaurants List */}
      {viewMode === 'list' ? (
        <div className="px-4 pb-6 space-y-4">
          {restaurants.map((restaurant, index) => (
            <div key={restaurant.id} className="flex items-start gap-3">
              {/* Number Badge */}
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 shadow-md mt-2">
                {index + 1}
              </div>
              {/* Restaurant Card */}
              <div className="flex-1 min-w-0">
                <RestaurantCard restaurant={restaurant} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 pb-6">
          <div className="bg-white rounded-lg p-8 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Map view coming soon!</p>
          </div>
        </div>
      )}
    </div>
  )
}
