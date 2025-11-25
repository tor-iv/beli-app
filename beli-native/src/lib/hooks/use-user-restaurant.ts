/**
 * User Restaurant Hooks
 *
 * React Query hooks for user-restaurant relationships.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserRestaurantService } from '../services/user-restaurant/UserRestaurantService';
import { useSyncStore } from '../store/syncStore';
import { isOnline } from '../data-provider';
import type { UserRestaurantRelation } from '../../types';

/**
 * Get all relations for a user
 */
export function useUserRelations(userId?: string) {
  return useQuery({
    queryKey: ['user-restaurants', userId],
    queryFn: () => UserRestaurantService.getUserRelations(userId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get relation for a specific restaurant
 */
export function useRestaurantRelation(userId: string | undefined, restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['user-restaurant', userId, restaurantId],
    queryFn: () => UserRestaurantService.getRelation(userId!, restaurantId!),
    enabled: !!userId && !!restaurantId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get "been" restaurants for a user
 */
export function useBeenRestaurants(userId?: string) {
  return useQuery({
    queryKey: ['user-restaurants', userId, 'been'],
    queryFn: () => UserRestaurantService.getBeenRestaurants(userId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get "want to try" restaurants for a user
 */
export function useWantToTryRestaurants(userId?: string) {
  return useQuery({
    queryKey: ['user-restaurants', userId, 'want_to_try'],
    queryFn: () => UserRestaurantService.getWantToTryRestaurants(userId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Mark restaurant as "been" mutation
 */
export function useMarkAsBeen() {
  const queryClient = useQueryClient();
  const addMutation = useSyncStore((s) => s.addMutation);

  return useMutation({
    mutationFn: async ({
      userId,
      restaurantId,
      rating,
      notes,
      tags,
      visitDate,
    }: {
      userId: string;
      restaurantId: string;
      rating?: number;
      notes?: string;
      tags?: string[];
      visitDate?: Date;
    }) => {
      if (!isOnline()) {
        addMutation('mark_been', { userId, restaurantId, rating, notes, tags, visitDate });
        return {
          userId,
          restaurantId,
          status: 'been',
          rating,
          notes,
          tags,
          visitDate: visitDate || new Date(),
          createdAt: new Date(),
        } as UserRestaurantRelation;
      }
      return UserRestaurantService.markAsBeen(userId, restaurantId, rating, notes, tags, visitDate);
    },
    onMutate: async ({ userId, restaurantId }) => {
      await queryClient.cancelQueries({ queryKey: ['user-restaurant', userId, restaurantId] });
      const previousRelation = queryClient.getQueryData(['user-restaurant', userId, restaurantId]);

      queryClient.setQueryData(['user-restaurant', userId, restaurantId], {
        userId,
        restaurantId,
        status: 'been',
        createdAt: new Date(),
      });

      return { previousRelation };
    },
    onError: (_err, { userId, restaurantId }, context) => {
      if (context?.previousRelation) {
        queryClient.setQueryData(['user-restaurant', userId, restaurantId], context.previousRelation);
      }
    },
    onSettled: (_, __, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-restaurants', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-restaurant'] });
    },
  });
}

/**
 * Mark restaurant as "want to try" mutation
 */
export function useMarkAsWantToTry() {
  const queryClient = useQueryClient();
  const addMutation = useSyncStore((s) => s.addMutation);

  return useMutation({
    mutationFn: async ({
      userId,
      restaurantId,
      notes,
      tags,
    }: {
      userId: string;
      restaurantId: string;
      notes?: string;
      tags?: string[];
    }) => {
      if (!isOnline()) {
        addMutation('mark_want_to_try', { userId, restaurantId, notes, tags });
        return {
          userId,
          restaurantId,
          status: 'want_to_try',
          notes,
          tags,
          createdAt: new Date(),
        } as UserRestaurantRelation;
      }
      return UserRestaurantService.markAsWantToTry(userId, restaurantId, notes, tags);
    },
    onMutate: async ({ userId, restaurantId }) => {
      await queryClient.cancelQueries({ queryKey: ['user-restaurant', userId, restaurantId] });
      const previousRelation = queryClient.getQueryData(['user-restaurant', userId, restaurantId]);

      queryClient.setQueryData(['user-restaurant', userId, restaurantId], {
        userId,
        restaurantId,
        status: 'want_to_try',
        createdAt: new Date(),
      });

      return { previousRelation };
    },
    onError: (_err, { userId, restaurantId }, context) => {
      if (context?.previousRelation) {
        queryClient.setQueryData(['user-restaurant', userId, restaurantId], context.previousRelation);
      }
    },
    onSettled: (_, __, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-restaurants', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-restaurant'] });
    },
  });
}

/**
 * Update rating mutation
 */
export function useUpdateRating() {
  const queryClient = useQueryClient();
  const addMutation = useSyncStore((s) => s.addMutation);

  return useMutation({
    mutationFn: async ({
      userId,
      restaurantId,
      rating,
    }: {
      userId: string;
      restaurantId: string;
      rating: number;
    }) => {
      if (!isOnline()) {
        addMutation('update_rating', { userId, restaurantId, rating });
        return;
      }
      return UserRestaurantService.updateRating(userId, restaurantId, rating);
    },
    onMutate: async ({ userId, restaurantId, rating }) => {
      await queryClient.cancelQueries({ queryKey: ['user-restaurant', userId, restaurantId] });
      const previousRelation = queryClient.getQueryData<UserRestaurantRelation>([
        'user-restaurant',
        userId,
        restaurantId,
      ]);

      if (previousRelation) {
        queryClient.setQueryData(['user-restaurant', userId, restaurantId], {
          ...previousRelation,
          rating,
        });
      }

      return { previousRelation };
    },
    onError: (_err, { userId, restaurantId }, context) => {
      if (context?.previousRelation) {
        queryClient.setQueryData(['user-restaurant', userId, restaurantId], context.previousRelation);
      }
    },
    onSettled: (_, __, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-restaurants', userId] });
    },
  });
}

/**
 * Remove relation mutation
 */
export function useRemoveRelation() {
  const queryClient = useQueryClient();
  const addMutation = useSyncStore((s) => s.addMutation);

  return useMutation({
    mutationFn: async ({ userId, restaurantId }: { userId: string; restaurantId: string }) => {
      if (!isOnline()) {
        addMutation('remove_relation', { userId, restaurantId });
        return;
      }
      return UserRestaurantService.removeRelation(userId, restaurantId);
    },
    onMutate: async ({ userId, restaurantId }) => {
      await queryClient.cancelQueries({ queryKey: ['user-restaurant', userId, restaurantId] });
      const previousRelation = queryClient.getQueryData(['user-restaurant', userId, restaurantId]);

      queryClient.setQueryData(['user-restaurant', userId, restaurantId], null);

      return { previousRelation };
    },
    onError: (_err, { userId, restaurantId }, context) => {
      if (context?.previousRelation) {
        queryClient.setQueryData(['user-restaurant', userId, restaurantId], context.previousRelation);
      }
    },
    onSettled: (_, __, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-restaurants', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-restaurant'] });
    },
  });
}

/**
 * Get user's average rating
 */
export function useUserAverageRating(userId: string | undefined) {
  return useQuery({
    queryKey: ['user', userId, 'average-rating'],
    queryFn: () => UserRestaurantService.getUserAverageRating(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get restaurants by tag
 */
export function useRestaurantsByTag(userId: string | undefined, tag: string | undefined) {
  return useQuery({
    queryKey: ['user-restaurants', userId, 'tag', tag],
    queryFn: () => UserRestaurantService.getRestaurantsByTag(userId!, tag!),
    enabled: !!userId && !!tag,
    staleTime: 5 * 60 * 1000,
  });
}
