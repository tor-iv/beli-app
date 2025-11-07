import { useState, useCallback } from 'react';
import {
  useAddRankedRestaurant,
  useLikeActivity,
  useBookmarkActivity,
  useAddComment,
} from '@/lib/hooks';
import type { Activity, Restaurant, User, RankingResult } from '@/types';
import type { RestaurantSubmissionData } from '@/components/modals/add-restaurant-modal';

/**
 * Modal state type for managing all feed modals with discriminated union
 * This pattern allows TypeScript to narrow the type based on the 'type' field
 */
export type ModalState =
  | { type: 'comments'; activity: Activity }
  | { type: 'share'; activity: Activity }
  | { type: 'add'; restaurant: Restaurant }
  | { type: 'result'; restaurant: Restaurant; result: RankingResult; data: RestaurantSubmissionData }
  | { type: null };

/**
 * Feed modal handlers returned by useFeedModals
 */
export interface FeedModalHandlers {
  /** Handle like button click */
  handleLike: (activityId: string) => void;
  /** Handle comment button click */
  handleComment: (activity: Activity) => void;
  /** Handle share button click */
  handleShare: (activity: Activity) => void;
  /** Handle bookmark button click */
  handleBookmark: (activityId: string) => void;
  /** Handle add restaurant button click */
  handleAddPress: (restaurant: Restaurant) => void;
  /** Handle ranking completion */
  handleRankingComplete: (result: RankingResult, data: RestaurantSubmissionData) => Promise<void>;
  /** Handle result modal done */
  handleResultDone: () => void;
  /** Handle add comment */
  handleAddComment: (content: string) => void;
}

/**
 * Encapsulates all feed modal state and interaction handlers
 * Reduces feed page complexity by extracting modal management logic
 *
 * @param currentUser - Current logged-in user
 * @param feed - Array of feed activities
 * @returns Modal state and handlers
 *
 * @example
 * const { data: feed } = useFeed();
 * const { data: currentUser } = useCurrentUser();
 * const { modalState, handlers } = useFeedModals(currentUser, feed);
 *
 * return (
 *   <>
 *     <ActivityCard {...handlers} />
 *     {modalState.type === 'comments' && <CommentsModal activity={modalState.activity} />}
 *   </>
 * );
 */
export function useFeedModals(currentUser: User | undefined, feed: Activity[]) {
  const [modalState, setModalState] = useState<ModalState>({ type: null });

  // React Query mutations
  const addRankedRestaurantMutation = useAddRankedRestaurant();
  const likeMutation = useLikeActivity();
  const bookmarkMutation = useBookmarkActivity();
  const addCommentMutation = useAddComment();

  /**
   * Handle like/unlike on an activity
   * Uses optimistic updates for instant UI feedback
   */
  const handleLike = useCallback(
    (activityId: string) => {
      if (!currentUser) return;

      // Find current like status
      const activity = feed.find((a) => a.id === activityId);
      const isLiked = activity?.interactions?.likes.includes(currentUser.id) || false;

      // Trigger mutation with optimistic update
      likeMutation.mutate({ activityId, userId: currentUser.id, isLiked });
    },
    [currentUser, feed, likeMutation]
  );

  /**
   * Open comments modal for an activity
   */
  const handleComment = useCallback((activity: Activity) => {
    setModalState({ type: 'comments', activity });
  }, []);

  /**
   * Open share modal for an activity
   */
  const handleShare = useCallback((activity: Activity) => {
    setModalState({ type: 'share', activity });
  }, []);

  /**
   * Handle bookmark/unbookmark on an activity
   * Uses optimistic updates for instant UI feedback
   */
  const handleBookmark = useCallback(
    (activityId: string) => {
      if (!currentUser) return;

      // Find current bookmark status
      const activity = feed.find((a) => a.id === activityId);
      const isBookmarked = activity?.interactions?.bookmarks.includes(currentUser.id) || false;

      // Trigger mutation with optimistic update
      bookmarkMutation.mutate({ activityId, userId: currentUser.id, isBookmarked });
    },
    [currentUser, feed, bookmarkMutation]
  );

  /**
   * Open add restaurant modal
   */
  const handleAddPress = useCallback((restaurant: Restaurant) => {
    setModalState({ type: 'add', restaurant });
  }, []);

  /**
   * Handle completion of restaurant ranking
   * Saves to backend and shows result modal
   */
  const handleRankingComplete = useCallback(
    async (result: RankingResult, data: RestaurantSubmissionData) => {
      if (!currentUser || modalState.type !== 'add') return;

      const restaurant = modalState.restaurant;

      try {
        // Save to MockDataService via mutation
        await addRankedRestaurantMutation.mutateAsync({
          userId: currentUser.id,
          restaurantId: restaurant.id,
          result,
          data: {
            notes: data.notes || undefined,
            photos: data.photos && data.photos.length > 0 ? data.photos : undefined,
            tags: data.labels && data.labels.length > 0 ? data.labels : undefined,
            companions: data.companions && data.companions.length > 0 ? data.companions : undefined,
          },
        });

        // Show result modal
        setModalState({ type: 'result', restaurant, result, data });
      } catch (error) {
        console.error('Error saving ranking:', error);
      }
    },
    [currentUser, modalState, addRankedRestaurantMutation]
  );

  /**
   * Close result modal and reset state
   */
  const handleResultDone = useCallback(() => {
    setModalState({ type: null });
  }, []);

  /**
   * Add a comment to an activity
   * Uses optimistic updates for instant UI feedback
   */
  const handleAddComment = useCallback(
    (content: string) => {
      if (modalState.type !== 'comments' || !currentUser) return;

      const activityId = modalState.activity.id;

      // Trigger mutation with optimistic update
      addCommentMutation.mutate({
        activityId,
        userId: currentUser.id,
        content,
      });
    },
    [modalState, currentUser, addCommentMutation]
  );

  const handlers: FeedModalHandlers = {
    handleLike,
    handleComment,
    handleShare,
    handleBookmark,
    handleAddPress,
    handleRankingComplete,
    handleResultDone,
    handleAddComment,
  };

  return { modalState, setModalState, handlers };
}
