/**
 * List Hooks
 *
 * React Query hooks for list management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ListService } from '../services/lists/ListService';
import { useSyncStore } from '../store/syncStore';
import { isOnline } from '../data-provider';
import type { List, ListScope, ListCategory } from '../../types';

/**
 * Get all lists for a user
 */
export function useUserLists(userId?: string) {
  return useQuery({
    queryKey: ['lists', 'user', userId],
    queryFn: () => ListService.getUserLists(userId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get lists by type for a user
 */
export function useUserListsByType(
  userId: string,
  listType: ListScope,
  category: ListCategory = 'restaurants'
) {
  return useQuery({
    queryKey: ['lists', 'user', userId, listType, category],
    queryFn: () => ListService.getUserListsByType(userId, listType, category),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get a specific list by ID
 */
export function useList(listId: string | undefined) {
  return useQuery({
    queryKey: ['list', listId],
    queryFn: () => ListService.getListById(listId!),
    enabled: !!listId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get featured/curated lists
 */
export function useFeaturedLists() {
  return useQuery({
    queryKey: ['lists', 'featured'],
    queryFn: () => ListService.getFeaturedLists(),
    staleTime: 10 * 60 * 1000, // Featured lists don't change often
  });
}

/**
 * Get user's progress through a featured list
 */
export function useListProgress(userId: string | undefined, listId: string | undefined) {
  return useQuery({
    queryKey: ['lists', 'progress', userId, listId],
    queryFn: () => ListService.getUserListProgress(userId!, listId!),
    enabled: !!userId && !!listId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get public lists for discovery
 */
export function usePublicLists(limit: number = 20) {
  return useQuery({
    queryKey: ['lists', 'public', limit],
    queryFn: () => ListService.getPublicLists(limit),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get list counts for a user
 */
export function useListCounts(userId: string | undefined) {
  return useQuery({
    queryKey: ['lists', 'counts', userId],
    queryFn: () => ListService.getListCounts(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create list mutation
 */
export function useCreateList() {
  const queryClient = useQueryClient();
  const addMutation = useSyncStore((s) => s.addMutation);

  return useMutation({
    mutationFn: async ({
      userId,
      name,
      description,
      listType,
      category,
      isPublic,
    }: {
      userId: string;
      name: string;
      description: string;
      listType: ListScope;
      category: ListCategory;
      isPublic?: boolean;
    }) => {
      if (!isOnline()) {
        addMutation('create_list', { userId, name, description, listType, category, isPublic });
        // Return a temporary list
        return {
          id: `temp-${Date.now()}`,
          userId,
          name,
          description,
          restaurants: [],
          isPublic: isPublic || false,
          category,
          listType,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as List;
      }
      return ListService.createList(userId, name, description, listType, category, isPublic);
    },
    onSettled: (_, __, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['lists', 'user', userId] });
    },
  });
}

/**
 * Add restaurant to list mutation
 */
export function useAddToList() {
  const queryClient = useQueryClient();
  const addMutation = useSyncStore((s) => s.addMutation);

  return useMutation({
    mutationFn: async ({ listId, restaurantId }: { listId: string; restaurantId: string }) => {
      if (!isOnline()) {
        addMutation('add_to_list', { listId, restaurantId });
        return;
      }
      return ListService.addRestaurantToList(listId, restaurantId);
    },
    onMutate: async ({ listId, restaurantId }) => {
      await queryClient.cancelQueries({ queryKey: ['list', listId] });
      const previousList = queryClient.getQueryData<List>(['list', listId]);

      if (previousList) {
        queryClient.setQueryData<List>(['list', listId], {
          ...previousList,
          restaurants: [...previousList.restaurants, restaurantId],
          updatedAt: new Date(),
        });
      }

      return { previousList };
    },
    onError: (_err, { listId }, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(['list', listId], context.previousList);
      }
    },
    onSettled: (_, __, { listId }) => {
      queryClient.invalidateQueries({ queryKey: ['list', listId] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}

/**
 * Remove restaurant from list mutation
 */
export function useRemoveFromList() {
  const queryClient = useQueryClient();
  const addMutation = useSyncStore((s) => s.addMutation);

  return useMutation({
    mutationFn: async ({ listId, restaurantId }: { listId: string; restaurantId: string }) => {
      if (!isOnline()) {
        addMutation('remove_from_list', { listId, restaurantId });
        return;
      }
      return ListService.removeRestaurantFromList(listId, restaurantId);
    },
    onMutate: async ({ listId, restaurantId }) => {
      await queryClient.cancelQueries({ queryKey: ['list', listId] });
      const previousList = queryClient.getQueryData<List>(['list', listId]);

      if (previousList) {
        queryClient.setQueryData<List>(['list', listId], {
          ...previousList,
          restaurants: previousList.restaurants.filter((id) => id !== restaurantId),
          updatedAt: new Date(),
        });
      }

      return { previousList };
    },
    onError: (_err, { listId }, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(['list', listId], context.previousList);
      }
    },
    onSettled: (_, __, { listId }) => {
      queryClient.invalidateQueries({ queryKey: ['list', listId] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}

/**
 * Delete list mutation
 */
export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listId: string) => ListService.deleteList(listId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}

/**
 * Update list mutation
 */
export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      listId,
      updates,
    }: {
      listId: string;
      updates: Partial<Pick<List, 'name' | 'description' | 'isPublic' | 'thumbnailImage'>>;
    }) => ListService.updateList(listId, updates),
    onSettled: (_, __, { listId }) => {
      queryClient.invalidateQueries({ queryKey: ['list', listId] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}
