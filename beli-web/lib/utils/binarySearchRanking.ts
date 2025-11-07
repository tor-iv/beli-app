import {
  Restaurant,
  RankedRestaurant,
  RankingState,
  RankingComparison,
  RankingResult,
  InitialSentiment,
  ListCategory,
} from '@/types';

/**
 * Initialize a new ranking session
 */
export function initializeRanking(
  targetRestaurantId: string,
  category: ListCategory,
  rankedList: RankedRestaurant[],
  initialSentiment: InitialSentiment
): RankingState {
  const totalCount = rankedList.length;

  // Set initial search bounds based on sentiment
  let leftBound = 0;
  let rightBound = totalCount;

  if (totalCount > 0) {
    if (initialSentiment === 'liked') {
      // Start search in top 50%
      rightBound = Math.ceil(totalCount / 2);
    } else if (initialSentiment === 'fine') {
      // Start search in middle 30-70%
      leftBound = Math.floor(totalCount * 0.3);
      rightBound = Math.ceil(totalCount * 0.7);
    } else if (initialSentiment === 'disliked') {
      // Start search in bottom 50%
      leftBound = Math.floor(totalCount / 2);
    }
  }

  return {
    targetRestaurantId,
    category,
    initialSentiment,
    rankedList,
    comparisonHistory: [],
    currentLeftBound: leftBound,
    currentRightBound: rightBound,
    skipsRemaining: 2,
    isComplete: false,
  };
}

/**
 * Get the next restaurant to compare against
 */
export function getNextComparison(state: RankingState): RankedRestaurant | null {
  const { rankedList, currentLeftBound, currentRightBound } = state;

  // If bounds have converged, we're done
  if (currentLeftBound >= currentRightBound) {
    return null;
  }

  // Binary search: get middle point
  const midPoint = Math.floor((currentLeftBound + currentRightBound) / 2);
  return rankedList[midPoint];
}

/**
 * Process a user's comparison choice
 *
 * @param state - Current ranking state
 * @param comparisonRestaurant - The restaurant being compared against
 * @param choice - User's choice:
 *   - 'left': Target restaurant is better (narrow search to upper half)
 *   - 'right': Comparison restaurant is better (narrow search to lower half)
 *   - 'skip': Skip this comparison and move forward (limited uses)
 */
export function processComparison(
  state: RankingState,
  comparisonRestaurant: Restaurant,
  choice: 'left' | 'right' | 'skip'
): RankingState {
  const { currentLeftBound, currentRightBound, comparisonHistory, skipsRemaining } = state;
  const midPoint = Math.floor((currentLeftBound + currentRightBound) / 2);

  // Record the comparison
  const comparison: RankingComparison = {
    restaurantId: state.targetRestaurantId,
    choice,
    leftBound: currentLeftBound,
    rightBound: currentRightBound,
    comparisonRestaurantId: comparisonRestaurant.id,
  };

  let newLeftBound = currentLeftBound;
  let newRightBound = currentRightBound;
  let newSkipsRemaining = skipsRemaining;

  if (choice === 'left') {
    // Target restaurant is better - search in upper half
    newRightBound = midPoint;
  } else if (choice === 'right') {
    // Comparison restaurant is better - search in lower half
    newLeftBound = midPoint + 1;
  } else if (choice === 'skip') {
    // Skip this comparison - move forward to next comparison point
    // We always skip forward for predictable behavior
    newSkipsRemaining = Math.max(0, skipsRemaining - 1);
    newLeftBound = midPoint + 1;
  }

  // Check if complete
  const isComplete = newLeftBound >= newRightBound;

  return {
    ...state,
    comparisonHistory: [...comparisonHistory, comparison],
    currentLeftBound: newLeftBound,
    currentRightBound: newRightBound,
    skipsRemaining: newSkipsRemaining,
    isComplete,
  };
}

/**
 * Undo the last comparison
 */
export function undoLastComparison(state: RankingState): RankingState {
  const { comparisonHistory } = state;

  if (comparisonHistory.length === 0) {
    return state;
  }

  // Remove last comparison and restore previous bounds
  const newHistory = comparisonHistory.slice(0, -1);
  const previousComparison = comparisonHistory[comparisonHistory.length - 1];

  // Restore skips if the last action was a skip
  const newSkipsRemaining = previousComparison.choice === 'skip'
    ? Math.min(state.skipsRemaining + 1, 2)
    : state.skipsRemaining;

  return {
    ...state,
    comparisonHistory: newHistory,
    currentLeftBound: previousComparison.leftBound,
    currentRightBound: previousComparison.rightBound,
    skipsRemaining: newSkipsRemaining,
    isComplete: false,
  };
}

/**
 * Calculate final rating based on position in ranked list
 *
 * Rating scale:
 * - Position 0 (top): ~9.5
 * - Middle position: ~7.5
 * - Bottom position: ~5.0
 *
 * This maps positions to a 5.0-10.0 range, which is more realistic
 * than using the full 0-10 scale.
 */
export function calculateRating(
  position: number,
  totalCount: number
): number {
  // Handle edge case: first restaurant in list
  if (totalCount === 0) {
    return 7.5; // Default rating for first restaurant
  }

  // Handle edge cases for position
  if (position === 0) {
    return 9.5; // Top position gets excellent rating
  }

  if (position >= totalCount) {
    return 5.0; // Bottom position (shouldn't happen normally)
  }

  // Calculate percentile (0-100, where 100 is best)
  const percentile = (1 - position / totalCount) * 100;

  // Map percentile to 5.0-10.0 rating range
  // This gives more realistic ratings than using full 0-10 scale
  const rating = 5.0 + (percentile / 100) * 5.0;

  // Round to 1 decimal place
  return Math.round(rating * 10) / 10;
}

/**
 * Generate final ranking result
 */
export function generateRankingResult(state: RankingState): RankingResult {
  const { targetRestaurantId, category, currentLeftBound, rankedList, comparisonHistory } = state;

  const finalPosition = currentLeftBound;
  const totalRestaurants = rankedList.length + 1; // Include the new restaurant
  const rating = calculateRating(finalPosition, rankedList.length);
  const percentile = ((totalRestaurants - finalPosition) / totalRestaurants) * 100;

  return {
    restaurantId: targetRestaurantId,
    category,
    finalPosition,
    totalRestaurants,
    rating,
    percentile: Math.round(percentile),
    comparisonsCount: comparisonHistory.length,
  };
}

/**
 * Get progress information for UI display
 */
export function getRankingProgress(state: RankingState): {
  currentComparison: number;
  estimatedTotal: number;
  percentComplete: number;
} {
  const { comparisonHistory, currentLeftBound, currentRightBound } = state;

  // Estimate total comparisons needed (log2 of list size)
  const rangeSize = currentRightBound - currentLeftBound;
  const estimatedRemaining = rangeSize > 0 ? Math.ceil(Math.log2(rangeSize)) : 0;
  const estimatedTotal = comparisonHistory.length + estimatedRemaining;

  const percentComplete = estimatedTotal > 0
    ? Math.round((comparisonHistory.length / estimatedTotal) * 100)
    : 100;

  return {
    currentComparison: comparisonHistory.length + 1,
    estimatedTotal: Math.max(estimatedTotal, comparisonHistory.length + 1),
    percentComplete,
  };
}
