'use client';

import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Profile page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-gray-900">Something went wrong!</h2>

          <p className="mb-6 text-base text-gray-700">
            We encountered an error while loading this profile. Please try again.
          </p>

          {error.message && (
            <div className="mb-6 rounded-lg bg-gray-50 p-4 text-left">
              <p className="break-words font-mono text-sm text-gray-800">{error.message}</p>
            </div>
          )}

          <div className="flex justify-center gap-3">
            <Button onClick={reset} variant="default">
              Try again
            </Button>
            <Button onClick={() => window.history.back()} variant="outline">
              Go back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
