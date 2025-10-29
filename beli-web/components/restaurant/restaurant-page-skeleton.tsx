import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function RestaurantPageSkeleton() {
  return (
    <>
      {/* Map Header Skeleton */}
      <Skeleton className="w-full h-[280px] md:h-[360px]" />

      {/* Content Card */}
      <div className="relative -mt-16 z-10">
        <Card className="rounded-t-3xl shadow-xl border-0">
          <CardContent className="p-0">
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
              {/* Header Skeleton */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Skeleton className="h-9 w-3/4 mb-2" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-md" />
                  </div>
                </div>
              </div>

              {/* Tags Skeleton */}
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>

              {/* Metadata Skeleton */}
              <div className="space-y-3 py-4 border-b">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-5 w-1/2" />
              </div>

              {/* Action Buttons Skeleton */}
              <div className="grid grid-cols-2 gap-3 my-6">
                <Skeleton className="h-20 rounded-md" />
                <Skeleton className="h-20 rounded-md" />
                <Skeleton className="h-20 rounded-md" />
                <Skeleton className="h-20 rounded-md" />
              </div>

              {/* Rating Skeleton */}
              <Skeleton className="h-40 w-full rounded-lg mb-6" />

              {/* Scores Skeleton */}
              <div className="flex gap-4 mb-6">
                <Skeleton className="h-48 w-[240px] flex-shrink-0 rounded-lg" />
                <Skeleton className="h-48 w-[240px] flex-shrink-0 rounded-lg" />
                <Skeleton className="h-48 w-[240px] flex-shrink-0 rounded-lg" />
              </div>

              {/* Dishes Skeleton */}
              <div className="flex gap-4 mb-6">
                <Skeleton className="h-[180px] w-[240px] flex-shrink-0 rounded-lg" />
                <Skeleton className="h-[180px] w-[240px] flex-shrink-0 rounded-lg" />
                <Skeleton className="h-[180px] w-[240px] flex-shrink-0 rounded-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
