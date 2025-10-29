import Image from 'next/image';
import { Restaurant } from '@/types';

interface PopularDishGalleryProps {
  restaurant: Restaurant;
}

export function PopularDishGallery({ restaurant }: PopularDishGalleryProps) {
  // Use popularDishImages if available, otherwise fall back to restaurant images
  const images = restaurant.popularDishImages && restaurant.popularDishImages.length > 0
    ? restaurant.popularDishImages
    : restaurant.images || [];

  // Don't render if no images
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="py-6">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Popular Dishes</h3>
        {images.length > 3 && (
          <button className="text-sm text-primary hover:underline">
            See all photos
          </button>
        )}
      </div>

      {/* Horizontal Scrolling Gallery */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-[240px] h-[180px] relative rounded-lg overflow-hidden bg-gray-100"
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
