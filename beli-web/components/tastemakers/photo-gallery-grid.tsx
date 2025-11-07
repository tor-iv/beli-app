'use client';

import Image from 'next/image';
import { useState } from 'react';

import type { Restaurant } from '@/types';

interface PhotoGalleryGridProps {
  restaurants: Restaurant[];
}

export const PhotoGalleryGrid = ({ restaurants }: PhotoGalleryGridProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Get first 6 restaurants with images
  const restaurantsWithImages = restaurants.filter((r) => r.images?.[0]).slice(0, 6);

  if (restaurantsWithImages.length === 0) return null;

  return (
    <>
      <div className="mb-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {restaurantsWithImages.map((restaurant, index) => (
            <div
              key={restaurant.id}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl"
              onClick={() => setSelectedImage(restaurant.images[0])}
            >
              <Image
                src={restaurant.images[0]}
                alt={restaurant.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {/* Overlay with restaurant info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-bold text-white drop-shadow-lg">
                    {index + 1}. {restaurant.name}
                  </p>
                  <p className="mt-1 text-xs text-white/90 drop-shadow-md">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative aspect-video w-full max-w-5xl">
            <Image src={selectedImage} alt="Restaurant photo" fill className="object-contain" />
            <button
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
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
