'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { memo } from 'react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorState = memo(({
  message = 'Something went wrong. Please try again.',
  onRetry,
  showRetry = true,
}: ErrorStateProps) => {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>

        <h3 className="mb-2 text-xl font-semibold text-gray-900">Oops! Something went wrong</h3>

        <p className="mb-6 text-gray-600">{message}</p>

        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-white transition-colors hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
});
