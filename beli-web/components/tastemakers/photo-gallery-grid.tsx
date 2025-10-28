'use client';

import Image from 'next/image';
import { Restaurant } from '@/types';
import { useState } from 'react';

interface PhotoGalleryGridProps {
  restaurants: Restaurant[];
}

export function PhotoGalleryGrid({ restaurants }: PhotoGalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Get first 6 restaurants with images
  const restaurantsWithImages = restaurants.filter(r => r.images?.[0]).slice(0, 6);

  if (restaurantsWithImages.length === 0) return null;

  return (
    <>
      <div className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {restaurantsWithImages.map((restaurant, index) => (
            <div
              key={restaurant.id}
              className="relative aspect-square group cursor-pointer overflow-hidden rounded-xl"
              onClick={() => setSelectedImage(restaurant.images[0])}
            >
              <Image
                src={restaurant.images[0]}
                alt={restaurant.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {/* Overlay with restaurant info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-bold text-sm drop-shadow-lg">
                    {index + 1}. {restaurant.name}
                  </p>
                  <p className="text-white/90 text-xs mt-1 drop-shadow-md">
                    {restaurant.location.neighborhood}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full max-w-5xl aspect-video">
            <Image
              src={selectedImage}
              alt="Restaurant photo"
              fill
              className="object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
