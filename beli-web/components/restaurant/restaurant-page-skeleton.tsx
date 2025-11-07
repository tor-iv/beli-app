import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const RestaurantPageSkeleton = () => {
  return (
    <>
      {/* Map Header Skeleton */}
      <Skeleton className="h-[280px] w-full md:h-[360px]" />

      {/* Content Card */}
      <div className="relative z-10 -mt-16">
        <Card className="rounded-t-3xl border-0 shadow-xl">
          <CardContent className="p-0">
            <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
              {/* Header Skeleton */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Skeleton className="mb-2 h-9 w-3/4" />
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
              <div className="mb-4 flex gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>

              {/* Metadata Skeleton */}
              <div className="space-y-3 border-b py-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-5 w-1/2" />
              </div>

              {/* Action Buttons Skeleton */}
              <div className="my-6 grid grid-cols-2 gap-3">
                <Skeleton className="h-20 rounded-md" />
                <Skeleton className="h-20 rounded-md" />
                <Skeleton className="h-20 rounded-md" />
                <Skeleton className="h-20 rounded-md" />
              </div>

              {/* Rating Skeleton */}
              <Skeleton className="mb-6 h-40 w-full rounded-lg" />

              {/* Scores Skeleton */}
              <div className="mb-6 flex gap-4">
                <Skeleton className="h-48 w-[240px] flex-shrink-0 rounded-lg" />
                <Skeleton className="h-48 w-[240px] flex-shrink-0 rounded-lg" />
                <Skeleton className="h-48 w-[240px] flex-shrink-0 rounded-lg" />
              </div>

              {/* Dishes Skeleton */}
              <div className="mb-6 flex gap-4">
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
