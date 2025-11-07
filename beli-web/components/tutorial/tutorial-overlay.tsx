'use client';

import { ChevronLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';

interface TutorialOverlayProps {
  currentStep: number;
  totalSteps: number;
  featureName: string;
  onBack?: () => void;
  onNext: () => void;
  backDisabled?: boolean;
}

export const TutorialOverlay = memo(({
  currentStep,
  totalSteps,
  featureName,
  onBack,
  onNext,
  backDisabled = false,
}: TutorialOverlayProps) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:bottom-auto md:left-auto md:right-4 md:top-4"
      role="region"
      aria-label="Tutorial navigation"
    >
      <div className="border border-gray-200 bg-white/95 p-4 shadow-2xl backdrop-blur-md md:w-[400px] md:rounded-2xl md:p-6">
        {/* Progress Indicator */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-900">Tutorial: {featureName}</div>
          <div className="text-sm font-semibold text-primary" aria-live="polite">
            {currentStep} of {totalSteps}
          </div>
        </div>

        {/* Progress Bar */}
        <div
          className="mb-6 h-2 w-full rounded-full bg-gray-200"
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`Tutorial progress: step ${currentStep} of ${totalSteps}`}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {onBack && (
            <button
              onClick={onBack}
              disabled={backDisabled}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-all ${
                backDisabled
                  ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={onNext}
            className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition-all hover:bg-primary/90"
          >
            <span>{currentStep === totalSteps ? 'Complete Demo' : 'Next Feature'}</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Helper Text */}
        <p className="mt-4 text-center text-xs text-gray-600">
          {currentStep === totalSteps
            ? 'Click to finish the tutorial and explore the full app'
            : 'Explore this feature, then click Next to continue'}
        </p>
      </div>
    </div>
  );
});
