'use client';

import { X, GraduationCap } from 'lucide-react';
import { useState, memo } from 'react';

interface TutorialBannerProps {
  featureName: string;
  description?: string;
}

export const TutorialBanner = memo(({
  featureName,
  description,
}: TutorialBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="border-b border-primary/20 bg-primary/10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Tutorial Mode: {featureName}
              </div>
              {description && (
                <div className="hidden text-xs text-gray-600 md:block">{description}</div>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-primary/20"
            aria-label="Dismiss banner"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
});
