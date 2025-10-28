import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GroupDinnerCard from './GroupDinnerCard';
import { GroupDinnerMatch } from '../../types';
import { colors, spacing, typography, shadows } from '../../theme';

interface RestaurantSwiperProps {
  matches: GroupDinnerMatch[];
  savedRestaurants: GroupDinnerMatch[];
  onSwipeLeft: (match: GroupDinnerMatch) => void;
  onSwipeRight: (match: GroupDinnerMatch) => void;
  onShuffle: () => void;
  onCardPress: (match: GroupDinnerMatch) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export default function RestaurantSwiper({
  matches,
  savedRestaurants,
  onSwipeLeft,
  onSwipeRight,
  onShuffle,
  onCardPress,
}: RestaurantSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Track savedRestaurants in a ref so panResponder can access fresh value
  const savedRestaurantsRef = useRef(savedRestaurants);

  // Track callbacks in refs so panResponder can access fresh values
  const onSwipeRightRef = useRef(onSwipeRight);
  const onSwipeLeftRef = useRef(onSwipeLeft);

  // Track current index in a ref to prevent race conditions with rapid swipes
  const currentIndexRef = useRef(0);

  // Track if a swipe is currently in progress
  const isSwipingRef = useRef(false);

  // Sync refs with prop changes
  useEffect(() => {
    savedRestaurantsRef.current = savedRestaurants;
    onSwipeRightRef.current = onSwipeRight;
    onSwipeLeftRef.current = onSwipeLeft;
  }, [savedRestaurants, onSwipeRight, onSwipeLeft]);

  // Sync currentIndexRef with currentIndex state
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        // Block gesture if swipe in progress
        if (isSwipingRef.current) {
          return;
        }

        position.setValue({ x: gesture.dx, y: 0 });

        // Set swipe direction for visual feedback
        if (gesture.dx > 50) {
          setSwipeDirection('right');
        } else if (gesture.dx < -50) {
          setSwipeDirection('left');
        } else {
          setSwipeDirection(null);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        // Block if swipe already in progress
        if (isSwipingRef.current) {
          return;
        }

        if (gesture.dx > SWIPE_THRESHOLD) {
          // Block if already at limit (use ref to get fresh value)
          if (savedRestaurantsRef.current.length >= 3) {
            resetPosition();
            return;
          }
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          // Swipe left - pass
          forceSwipe('left');
        } else {
          // Reset position
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction: 'left' | 'right') => {
    // Set swipe in progress flag to block concurrent swipes
    isSwipingRef.current = true;

    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    // Use ref to get current index and increment it immediately
    const indexToProcess = currentIndexRef.current;

    // Increment the ref immediately to prevent race conditions
    currentIndexRef.current = indexToProcess + 1;

    console.log('[RestaurantSwiper] Starting swipe. Processing index:', indexToProcess, 'Next index will be:', currentIndexRef.current);

    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction, indexToProcess));
  };

  const onSwipeComplete = (direction: 'left' | 'right', indexToProcess: number) => {
    const match = matches[indexToProcess];
    console.log('[RestaurantSwiper] onSwipeComplete - processing index:', indexToProcess, 'Restaurant:', match?.restaurant.name);

    // Let parent handle all validation and state updates
    // Use refs to get fresh callback references
    if (direction === 'right') {
      console.log('[RestaurantSwiper] Swipe right complete:', match.restaurant.name, 'Current saved count:', savedRestaurantsRef.current.length);
      onSwipeRightRef.current(match);
    } else {
      onSwipeLeftRef.current(match);
    }

    // Reset position and direction
    position.setValue({ x: 0, y: 0 });
    setSwipeDirection(null);

    // Update state to match ref (for UI rendering)
    const newIndex = indexToProcess + 1;
    console.log('[RestaurantSwiper] Setting state currentIndex to:', newIndex);
    setCurrentIndex(newIndex);

    // Clear swipe in progress flag
    isSwipingRef.current = false;
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
    setSwipeDirection(null);
  };

  const handlePass = () => {
    // Block if swipe already in progress
    if (isSwipingRef.current) {
      return;
    }
    forceSwipe('left');
  };

  const handleLock = () => {
    // Block if swipe already in progress
    if (isSwipingRef.current) {
      return;
    }
    // Block if already at limit (use ref to get fresh value)
    if (savedRestaurantsRef.current.length >= 3) {
      return;
    }
    forceSwipe('right');
  };

  const handleShuffle = () => {
    // Block if swipe in progress
    if (isSwipingRef.current) {
      return;
    }

    // Animate a quick fade
    Animated.sequence([
      Animated.timing(position, {
        toValue: { x: 0, y: -20 },
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(position, {
        toValue: { x: 0, y: 0 },
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Reset both state and ref to beginning
      currentIndexRef.current = 0;
      setCurrentIndex(0);
      onShuffle();
    });
  };

  // Check if we've swiped through all cards
  const hasMoreCards = currentIndex < matches.length;
  const currentMatch = hasMoreCards ? matches[currentIndex] : null;
  const nextMatch = currentIndex + 1 < matches.length ? matches[currentIndex + 1] : null;

  const rotateCard = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const animatedCardStyle = {
    transform: [
      { translateX: position.x },
      { rotate: rotateCard },
    ],
  };

  const swipeLabelOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, -50, 0, 50, SCREEN_WIDTH],
    outputRange: [1, 0.5, 0, 0.5, 1],
  });

  return (
    <View style={styles.container}>
      {!hasMoreCards ? (
        /* Empty state - no more cards */
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle-outline" size={64} color={colors.primary} />
          <Text style={styles.emptyTitle}>No more restaurants!</Text>
          <Text style={styles.emptyText}>
            You've swiped through all available matches. Click shuffle below to see restaurants again.
          </Text>
        </View>
      ) : (
        /* Cards Stack */
        <View style={styles.cardStack}>
          {/* Next card (background) */}
          {nextMatch && (
            <View style={[styles.cardWrapper, styles.nextCard]}>
              <GroupDinnerCard
                key={nextMatch.restaurant.id}
                match={nextMatch}
                savedCount={savedRestaurants.length}
              />
            </View>
          )}

          {/* Current card */}
          {currentMatch && (
            <Animated.View
              style={[styles.cardWrapper, animatedCardStyle]}
              {...panResponder.panHandlers}
            >
              <GroupDinnerCard
                key={currentMatch.restaurant.id}
                match={currentMatch}
                onViewDetails={() => onCardPress(currentMatch)}
                savedCount={savedRestaurants.length}
              />

            {/* Swipe direction labels */}
            {swipeDirection === 'left' && (
              <Animated.View
                style={[
                  styles.swipeLabel,
                  styles.swipeLabelLeft,
                  { opacity: swipeLabelOpacity },
                ]}
              >
                <Text style={styles.swipeLabelText}>PASS</Text>
              </Animated.View>
            )}
            {swipeDirection === 'right' && (
              <Animated.View
                style={[
                  styles.swipeLabel,
                  styles.swipeLabelRight,
                  { opacity: swipeLabelOpacity },
                ]}
              >
                <Text style={styles.swipeLabelText}>SAVE</Text>
              </Animated.View>
            )}
          </Animated.View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={handlePass}>
          <Ionicons name="close" size={32} color={colors.error} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.shuffleButton]}
          onPress={handleShuffle}
        >
          <Ionicons name="shuffle" size={28} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleLock}>
          <Ionicons name="heart" size={32} color={colors.success} />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardStack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardWrapper: {
    position: 'absolute',
  },
  nextCard: {
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
  },
  swipeLabel: {
    position: 'absolute',
    top: 50,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 3,
  },
  swipeLabelLeft: {
    left: 30,
    borderColor: colors.error,
    transform: [{ rotate: '-20deg' }],
  },
  swipeLabelRight: {
    right: 30,
    borderColor: colors.success,
    transform: [{ rotate: '20deg' }],
  },
  swipeLabelText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
    color: colors.textPrimary,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.xl,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.cardWhite,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  shuffleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 29,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
