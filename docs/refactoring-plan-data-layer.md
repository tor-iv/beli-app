# Data Layer Abstraction Refactoring Plan

## Priority: P0 (Highest Priority)

## Problem Statement

### Issue: Data Layer Leaky Abstraction

The beli-web application has **32 direct `MockDataService` calls** that bypass the React Query abstraction layer, undermining the benefits of using React Query for data management.

### Primary Location
- `app/lists/page.tsx:89-143` (main offender)
- Multiple other pages across the application

### Current Anti-Pattern

```typescript
// ANTI-PATTERN: Direct service calls in components
useEffect(() => {
  const loadViewRestaurants = async () => {
    let data: Restaurant[] = [];
    switch (viewParam) {
      case 'reserve':
        data = await MockDataService.getReservableRestaurants(20);
        break;
      case 'group':
        data = await MockDataService.getGroupFriendlyRestaurants(20);
        break;
      case 'delivery':
        data = await MockDataService.getDeliveryRestaurants(20);
        break;
      case 'outdoor':
        data = await MockDataService.getOutdoorSeatingRestaurants(20);
        break;
    }
    setViewRestaurants(data);
  };
  loadViewRestaurants();
}, [viewParam]);
```

## Impact Analysis

### Performance Impact
- **Lost caching**: Same data fetched multiple times
- **No deduplication**: Multiple components fetching same data simultaneously
- **No background refetching**: Stale data not automatically updated
- **No optimistic updates**: Manual state management required

### Developer Experience Impact
- **Inconsistent patterns**: Some data uses React Query, some doesn't
- **Manual loading states**: Each component manages its own loading/error states
- **Difficult debugging**: Data flow is unclear and hard to trace
- **No DevTools support**: Can't use React Query DevTools for direct service calls

### User Experience Impact
- **Slower interactions**: No cached data means waiting for every fetch
- **Inconsistent UI states**: Different loading patterns across the app
- **Stale data displayed**: No automatic background updates

## Solution: Comprehensive React Query Hook Coverage

### Goal
Create React Query hooks for **all** data access patterns, ensuring zero direct `MockDataService` calls from components.

### Recommended Pattern

```typescript
// lib/hooks/use-special-lists.ts
import { useQuery } from '@tanstack/react-query';
import { MockDataService } from '@/lib/mockDataService';

/**
 * Hook for fetching reservable restaurants
 * @param limit - Number of restaurants to fetch (default: 20)
 */
export function useReservableRestaurants(limit: number = 20) {
  return useQuery({
    queryKey: ['restaurants', 'reservable', limit],
    queryFn: () => MockDataService.getReservableRestaurants(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching group-friendly restaurants
 * @param limit - Number of restaurants to fetch (default: 20)
 */
export function useGroupFriendlyRestaurants(limit: number = 20) {
  return useQuery({
    queryKey: ['restaurants', 'group-friendly', limit],
    queryFn: () => MockDataService.getGroupFriendlyRestaurants(limit),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for fetching delivery restaurants
 * @param limit - Number of restaurants to fetch (default: 20)
 */
export function useDeliveryRestaurants(limit: number = 20) {
  return useQuery({
    queryKey: ['restaurants', 'delivery', limit],
    queryFn: () => MockDataService.getDeliveryRestaurants(limit),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for fetching outdoor seating restaurants
 * @param limit - Number of restaurants to fetch (default: 20)
 */
export function useOutdoorSeatingRestaurants(limit: number = 20) {
  return useQuery({
    queryKey: ['restaurants', 'outdoor-seating', limit],
    queryFn: () => MockDataService.getOutdoorSeatingRestaurants(limit),
    staleTime: 5 * 60 * 1000,
  });
}
```

### Refactored Component Usage

```typescript
// app/lists/page.tsx (AFTER refactor)
import { useReservableRestaurants, useGroupFriendlyRestaurants } from '@/lib/hooks/use-special-lists';

function ListsPage() {
  const [viewParam] = useSearchParams();

  // Conditional hook execution based on view
  const { data: reservableRestaurants, isLoading: isLoadingReservable } =
    useReservableRestaurants(20, { enabled: viewParam === 'reserve' });

  const { data: groupRestaurants, isLoading: isLoadingGroup } =
    useGroupFriendlyRestaurants(20, { enabled: viewParam === 'group' });

  // Automatically cached, deduplicated, and refetched
  const viewRestaurants =
    viewParam === 'reserve' ? reservableRestaurants :
    viewParam === 'group' ? groupRestaurants :
    // ... etc
}
```

## Implementation Plan

### Phase 1: Audit (0.5 days)
1. ✅ Identify all direct `MockDataService` calls across the codebase
2. ✅ Document which methods are called and from where
3. ✅ Group by service method type (restaurants, users, lists, etc.)

### Phase 2: Create Missing Hooks (1 day)

#### New hooks to create:

**Restaurant Hooks** (`lib/hooks/use-special-lists.ts`):
- `useReservableRestaurants(limit)`
- `useGroupFriendlyRestaurants(limit)`
- `useDeliveryRestaurants(limit)`
- `useOutdoorSeatingRestaurants(limit)`
- `useDateNightRestaurants(limit)`
- `useBudgetRestaurants(limit)`

**List Hooks** (`lib/hooks/use-lists.ts` - extend existing):
- `useUpdateListOrder(userId, listType)` - mutation
- `useRemoveFromList(userId, listType)` - mutation
- `useBulkAddToList(userId, listType)` - mutation

**User Hooks** (`lib/hooks/use-user.ts` - extend existing):
- `useUpdateUserPreferences(userId)` - mutation
- `useFollowUser(userId)` - mutation
- `useUnfollowUser(userId)` - mutation

**Activity Hooks** (`lib/hooks/use-feed.ts` - extend existing):
- `useActivityComments(activityId)`
- `useAddComment(activityId)` - mutation

**Review Hooks** (`lib/hooks/use-reviews.ts` - new file):
- `useRestaurantReviews(restaurantId)`
- `useUserReviews(userId)`
- `useAddReview()` - mutation
- `useUpdateReview(reviewId)` - mutation

**Notification Hooks** (`lib/hooks/use-notifications.ts` - extend existing):
- `useMarkNotificationRead(notificationId)` - mutation
- `useMarkAllNotificationsRead()` - mutation

### Phase 3: Refactor Components (1.5 days)

Priority order (by traffic/complexity):

1. **app/lists/page.tsx** (highest impact)
   - Replace 8 direct service calls
   - Simplify state management
   - Remove manual loading states

2. **app/feed/page.tsx**
   - Replace activity mutations
   - Add optimistic updates for likes/comments

3. **app/profile/[username]/page.tsx**
   - Replace user data fetching
   - Add parallel queries for related data

4. **app/restaurant/[id]/page.tsx**
   - Replace restaurant detail fetching
   - Add review fetching

5. **app/search/page.tsx**
   - Already uses hooks (verify no direct calls)

6. **Other pages** (lower traffic)
   - Tastemakers pages
   - Settings pages
   - Leaderboard

### Phase 4: Testing & Validation (1 day)

1. **Manual testing**:
   - Verify all pages load correctly
   - Check network tab for duplicate requests (should be eliminated)
   - Test offline behavior (React Query cache should work)
   - Verify loading states are consistent

2. **Performance testing**:
   - Use React Query DevTools to verify caching
   - Check cache hit rates
   - Measure Time to Interactive (TTI) improvements

3. **Code review**:
   - Ensure zero remaining direct service calls
   - Verify all mutations have proper error handling
   - Check optimistic update implementations

## Success Metrics

### Before Refactoring
- ❌ 32 direct `MockDataService` calls
- ❌ Manual loading state management in components
- ❌ No cache sharing between components
- ❌ No background refetching
- ❌ Inconsistent error handling

### After Refactoring
- ✅ 0 direct `MockDataService` calls
- ✅ Automatic loading/error state management
- ✅ Shared cache across all components
- ✅ Automatic background refetching
- ✅ Consistent error handling via React Query

### Performance Improvements (Expected)
- **50% reduction** in redundant network requests
- **30% faster** page transitions (cached data)
- **Better UX**: Instant loading for cached data
- **Improved debugging**: React Query DevTools visibility

## Migration Checklist

- [ ] Create `use-special-lists.ts` hook file
- [ ] Create `use-reviews.ts` hook file
- [ ] Extend existing hook files with missing mutations
- [ ] Refactor `app/lists/page.tsx`
- [ ] Refactor `app/feed/page.tsx`
- [ ] Refactor `app/profile/[username]/page.tsx`
- [ ] Refactor `app/restaurant/[id]/page.tsx`
- [ ] Refactor remaining pages with direct calls
- [ ] Add JSDoc comments to all new hooks
- [ ] Test all refactored pages manually
- [ ] Verify with React Query DevTools
- [ ] Remove unused `useState`/`useEffect` code
- [ ] Update CLAUDE.md with new hook patterns

## Code Review Checklist

Before merging:
- [ ] Zero `MockDataService` imports in component files (except mutations)
- [ ] All hooks have proper TypeScript types
- [ ] All hooks have JSDoc comments
- [ ] Query keys follow consistent naming pattern
- [ ] Stale times are appropriate for data type
- [ ] Mutations have optimistic updates where appropriate
- [ ] Error handling is consistent
- [ ] Loading states are handled consistently
- [ ] No console errors in browser
- [ ] React Query DevTools shows proper cache behavior

## Estimated Effort

**Total: 4 days**

- Day 1: Audit + Create missing hooks
- Day 2: Refactor high-traffic pages (lists, feed, profile)
- Day 3: Refactor remaining pages + cleanup
- Day 4: Testing, validation, documentation

## Future Improvements

After this refactor:
1. Add query invalidation patterns for mutations
2. Implement prefetching for anticipated navigation
3. Add query cancelation for unmounted components
4. Consider query persistence to localStorage
5. Add error retry strategies per query type
6. Implement query deduplication testing

## References

- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [Query Key Conventions](https://tkdodo.eu/blog/effective-react-query-keys)
- [Mutations and Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
