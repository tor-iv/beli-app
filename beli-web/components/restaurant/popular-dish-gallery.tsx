import Image from 'next/image';

import type { Restaurant } from '@/types';

interface PopularDishGalleryProps {
  restaurant: Restaurant;
}

export const PopularDishGallery = ({ restaurant }: PopularDishGalleryProps) => {
  // Use popularDishImages if available, otherwise fall back to restaurant images
  const images =
    restaurant.popularDishImages && restaurant.popularDishImages.length > 0
      ? restaurant.popularDishImages
      : restaurant.images || [];

  // Don't render if no images
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="py-6">
      {/* Section Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Popular Dishes</h3>
        {images.length > 3 && (
          <button className="text-sm text-primary hover:underline">See all photos</button>
        )}
      </div>

      {/* Horizontal Scrolling Gallery */}
      <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className="relative h-[180px] w-[240px] flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
          >
            <Image
              src={imageUrl}
              alt={`${restaurant.name} - Dish ${index + 1}`}
              fill
              className="object-cover"
              sizes="240px"
            />
          </div>
        ))}
      </div>

      <style jsx global>{`
        /* Hide scrollbar but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
