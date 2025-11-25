/**
 * Group Dinner Hooks
 *
 * React Query hooks for group dining feature.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GroupDinnerService,
  GroupDinnerSession,
  GroupParticipant,
  GroupSuggestion,
  GroupMatch,
} from '../services/group-dinner/GroupDinnerService';
import { useState, useCallback } from 'react';

/**
 * Create and manage a group dinner session
 */
export function useGroupDinnerSession() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<GroupDinnerSession | null>(null);

  const createSession = useCallback(async (participants: GroupParticipant[]) => {
    const newSession = await GroupDinnerService.createSession(participants);
    setSession(newSession);
    return newSession;
  }, []);

  const recordSwipe = useCallback(
    async (restaurantId: string, swipe: 'like' | 'dislike', participantId: string) => {
      if (!session) return null;

      const match = await GroupDinnerService.recordSwipe(
        session.id,
        participantId,
        restaurantId,
        swipe
      );

      // Update local session state
      setSession((prev) => {
        if (!prev) return null;
        const updatedParticipants = prev.participants.map((p) =>
          p.userId === participantId ? { ...p, swipes: { ...p.swipes, [restaurantId]: swipe } } : p
        );

        const newMatches = match ? [...prev.matches, match] : prev.matches;

        return {
          ...prev,
          participants: updatedParticipants,
          matches: newMatches,
        };
      });

      return match;
    },
    [session]
  );

  const checkForMatch = useCallback(
    (restaurantId: string) => {
      if (!session) return null;
      return GroupDinnerService.checkForMatch(session, restaurantId);
    },
    [session]
  );

  const resetSession = useCallback(() => {
    setSession(null);
  }, []);

  return {
    session,
    createSession,
    recordSwipe,
    checkForMatch,
    resetSession,
    suggestions: session?.suggestions || [],
    matches: session?.matches || [],
    isActive: session?.status === 'active',
  };
}

/**
 * Get restaurant suggestions for a group
 */
export function useGroupSuggestions(participants: GroupParticipant[] | null, limit: number = 20) {
  return useQuery({
    queryKey: ['group-dinner', 'suggestions', participants?.map((p) => p.userId), limit],
    queryFn: () => GroupDinnerService.generateSuggestions(participants!, limit),
    enabled: !!participants && participants.length > 0,
    staleTime: 0, // Always generate fresh suggestions
  });
}

/**
 * Get top matches for a group
 */
export function useGroupTopMatches(participants: GroupParticipant[] | null, limit: number = 5) {
  return useQuery({
    queryKey: ['group-dinner', 'top-matches', participants?.map((p) => p.userId), limit],
    queryFn: () => GroupDinnerService.getTopMatches(participants!, limit),
    enabled: !!participants && participants.length > 0,
    staleTime: 0,
  });
}

/**
 * Get suggested friends for group dinner
 */
export function useSuggestedFriends(userId: string | undefined) {
  return useQuery({
    queryKey: ['group-dinner', 'suggested-friends', userId],
    queryFn: () => GroupDinnerService.getSuggestedFriends(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create a group participant from a user
 */
export function createParticipant(
  userId: string,
  displayName: string,
  avatar?: string,
  cuisinePreferences: string[] = [],
  priceRange: [number, number] = [1, 4],
  dietaryRestrictions?: string[]
): GroupParticipant {
  return {
    userId,
    displayName,
    avatar,
    preferences: {
      cuisineTypes: cuisinePreferences,
      priceRange,
      dietaryRestrictions,
    },
    swipes: {},
  };
}

// Re-export types
export type { GroupDinnerSession, GroupParticipant, GroupSuggestion, GroupMatch };
