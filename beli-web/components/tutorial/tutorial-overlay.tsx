'use client'

import { memo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ArrowRight } from 'lucide-react'

interface TutorialOverlayProps {
  currentStep: number
  totalSteps: number
  featureName: string
  onBack?: () => void
  onNext: () => void
  backDisabled?: boolean
}

export const TutorialOverlay = memo(function TutorialOverlay({
  currentStep,
  totalSteps,
  featureName,
  onBack,
  onNext,
  backDisabled = false,
}: TutorialOverlayProps) {
  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div
      className="fixed bottom-0 left-0 right-0 md:top-4 md:right-4 md:left-auto md:bottom-auto z-50"
      role="region"
      aria-label="Tutorial navigation"
    >
      <div className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-2xl md:rounded-2xl p-4 md:p-6 md:w-[400px]">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-gray-900">
            Tutorial: {featureName}
          </div>
          <div className="text-sm font-semibold text-primary" aria-live="polite">
            {currentStep} of {totalSteps}
          </div>
        </div>

        {/* Progress Bar */}
        <div
          className="w-full h-2 bg-gray-200 rounded-full mb-6"
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`Tutorial progress: step ${currentStep} of ${totalSteps}`}
        >
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {onBack && (
            <button
              onClick={onBack}
              disabled={backDisabled}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                backDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={onNext}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all group"
          >
            <span>{currentStep === totalSteps ? 'Complete Demo' : 'Next Feature'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-gray-600 mt-4 text-center">
          {currentStep === totalSteps
            ? 'Click to finish the tutorial and explore the full app'
            : 'Explore this feature, then click Next to continue'
          }
        </p>
      </div>
    </div>
  )
})
