import { Upload, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

export default function ImportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/feed">
              <ChevronLeft className="h-6 w-6 text-secondary transition-colors hover:text-foreground" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Import Existing List</h1>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <Upload className="h-10 w-10 text-gray-400" />
            </div>
          </div>

          <h2 className="mb-3 text-2xl font-bold text-foreground">Import Coming Soon</h2>

          <p className="mx-auto mb-6 max-w-md text-base text-secondary">
            This feature is coming soon! You&apos;ll be able to import your restaurant lists from
            other platforms like Google Maps, Yelp, and more.
          </p>

          <div className="mx-auto inline-flex max-w-sm flex-col items-start rounded-lg bg-gray-50 p-4 text-left">
            <p className="mb-2 text-sm font-semibold text-foreground">Planned Import Sources:</p>
            <ul className="space-y-1 text-sm text-secondary">
              <li>• Google Maps saved places</li>
              <li>• Yelp bookmarks</li>
              <li>• Instagram saved posts</li>
              <li>• CSV/Excel file upload</li>
              <li>• Other restaurant apps</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
