import { useQuery } from '@tanstack/react-query';

import { ListService } from '@/lib/services';

interface ListCounts {
  been: number;
  want_to_try: number;
  recs: number;
  playlists: number;
}

export function useListCounts(userId: string = 'current-user', category: string = 'restaurants') {
  return useQuery<ListCounts>({
    queryKey: ['list-counts', userId, category],
    queryFn: async () => {
      // Fetch all list types
      const [beenLists, wantLists, recsLists, playlistsLists] = await Promise.all([
        ListService.getUserListsByType(userId, 'been', category as any),
        ListService.getUserListsByType(userId, 'want_to_try', category as any),
        ListService.getUserListsByType(userId, 'recs', category as any),
        ListService.getUserListsByType(userId, 'playlists', category as any),
      ]);

      // Count unique restaurants in each list type
      const beenRestaurants = new Set(beenLists.flatMap((list) => list.restaurants));
      const wantRestaurants = new Set(wantLists.flatMap((list) => list.restaurants));
      const recsRestaurants = new Set(recsLists.flatMap((list) => list.restaurants));
      const playlistsCount = playlistsLists.length;

      return {
        been: beenRestaurants.size,
        want_to_try: wantRestaurants.size,
        recs: recsRestaurants.size,
        playlists: playlistsCount,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
