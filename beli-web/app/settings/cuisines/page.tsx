'use client';

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { CheckboxRow } from '@/components/settings/checkbox-row';
import { Button } from '@/components/ui/button';
import { useUserSettingsStore } from '@/lib/stores/user-settings-store';


const cuisineOptions = [
  'American',
  'Barbecue',
  'British',
  'Chinese',
  'French',
  'Greek',
  'Indian',
  'Italian',
  'Japanese',
  'Korean',
  'Latin American',
  'Mediterranean',
  'Mexican',
  'Middle Eastern',
  'Spanish',
  'Thai',
  'Vietnamese',
];

export default function DislikedCuisinesPage() {
  const router = useRouter();
  const dislikedCuisines = useUserSettingsStore((state) => state.dislikedCuisines);
  const toggleDislikedCuisine = useUserSettingsStore((state) => state.toggleDislikedCuisine);

  const handleSave = () => {
    // Cuisines are saved in real-time via Zustand store
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-100 px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="w-10" /> {/* Spacer */}
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 transition-colors hover:bg-gray-400"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">Your disliked cuisines</h1>
          <p className="text-sm text-secondary">
            Beli won&apos;t recommend these types of restaurants to you.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl">
        <div className="border-b border-gray-200 bg-white shadow-sm">
          {cuisineOptions.map((option) => (
            <CheckboxRow
              key={option}
              label={option}
              checked={dislikedCuisines.includes(option)}
              onCheckedChange={() => toggleDislikedCuisine(option)}
            />
          ))}
        </div>

        {/* Save Button */}
        <div className="px-4 py-6">
          <Button
            onClick={handleSave}
            className="h-12 w-full bg-primary text-lg hover:bg-primary/90"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
