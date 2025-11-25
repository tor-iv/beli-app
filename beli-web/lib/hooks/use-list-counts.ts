import { useQuery } from '@tanstack/react-query';

import { ListService, UserRestaurantService } from '@/lib/services';

import type { ListCategory } from '@/types';

interface ListCounts {
  been: number;
  want_to_try: number;
  recs: number;
  playlists: number;
}

/**
 * Hook to get restaurant counts for each list type
 *
 * Uses UserRestaurantService for personal lists (been, want_to_try, recs)
 * and ListService for custom playlists.
 *
 * @param userId - User ID (defaults to 'current-user')
 * @param category - Optional category filter ('all' shows all, specific category filters)
 */
export function useListCounts(
  userId: string = 'current-user',
  category?: ListCategory | 'all'
) {
  return useQuery<ListCounts>({
    queryKey: ['list-counts', userId, category],
    queryFn: async () => {
      // Fetch personal lists from UserRestaurantService (the correct data source)
      // and playlists from ListService
      const [beenRestaurants, wantRestaurants, recsRestaurants, playlistsLists] = await Promise.all([
        UserRestaurantService.getUserRestaurantsByStatus(userId, 'been', category),
        UserRestaurantService.getUserRestaurantsByStatus(userId, 'want_to_try', category),
        UserRestaurantService.getUserRestaurantsByStatus(userId, 'recommended', category),
        ListService.getUserListsByType(userId, 'playlists', (category as ListCategory) || 'restaurants'),
      ]);

      return {
        been: beenRestaurants.length,
        want_to_try: wantRestaurants.length,
        recs: recsRestaurants.length,
        playlists: playlistsLists.length,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
