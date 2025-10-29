'use client'

import { useState } from 'react'
import { X, GraduationCap } from 'lucide-react'

interface TutorialBannerProps {
  featureName: string
  description?: string
}

export function TutorialBanner({ featureName, description }: TutorialBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-primary/10 border-b border-primary/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Tutorial Mode: {featureName}
              </div>
              {description && (
                <div className="text-xs text-gray-600 hidden md:block">
                  {description}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 p-1 hover:bg-primary/20 rounded-lg transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}
