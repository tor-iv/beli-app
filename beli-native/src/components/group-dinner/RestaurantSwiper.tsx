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
  const [localSavedCount, setLocalSavedCount] = useState(savedRestaurants.length);
  const localSavedCountRef = useRef(localSavedCount);

  // Sync local saved count with parent prop and update ref
  useEffect(() => {
    setLocalSavedCount(savedRestaurants.length);
    localSavedCountRef.current = savedRestaurants.length;
  }, [savedRestaurants.length]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
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
        if (gesture.dx > SWIPE_THRESHOLD) {
          // Check if we can still save more restaurants
          const currentMatch = matches[currentIndex % matches.length];
          const isDuplicate = savedRestaurants.find(r => r.restaurant.id === currentMatch.restaurant.id);
          const canSave = !isDuplicate && localSavedCountRef.current < 3;

          console.log('[SWIPE CHECK]', {
            restaurant: currentMatch.restaurant.name,
            isDuplicate,
            localCount: localSavedCountRef.current,
            savedRestaurantsLength: savedRestaurants.length,
            canSave,
          });

          if (canSave) {
            // Allow swipe - will save and potentially trigger SelectionScreen
            forceSwipe('right');
          } else {
            // At limit or duplicate - just reset position
            console.log('[BLOCKED] Cannot save more restaurants');
            resetPosition();
          }
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
    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'left' | 'right') => {
    const match = matches[currentIndex % matches.length];

    // Update local count immediately for right swipes
    if (direction === 'right') {
      const isDuplicate = savedRestaurants.find(r => r.restaurant.id === match.restaurant.id);
      const willSave = !isDuplicate && savedRestaurants.length < 3;

      console.log('[SWIPE COMPLETE]', {
        restaurant: match.restaurant.name,
        isDuplicate,
        savedRestaurantsLength: savedRestaurants.length,
        willSave,
      });

      if (willSave) {
        setLocalSavedCount(prev => {
          const newCount = prev + 1;
          localSavedCountRef.current = newCount;
          console.log('[LOCAL COUNT UPDATED]', newCount);
          return newCount;
        });
        onSwipeRight(match);
      }
    } else {
      onSwipeLeft(match);
    }

    // Reset position and direction
    position.setValue({ x: 0, y: 0 });
    setSwipeDirection(null);

    // Increment to next card after a brief delay to show counter update
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 50);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
    setSwipeDirection(null);
  };

  const handlePass = () => {
    forceSwipe('left');
  };

  const handleLock = () => {
    // Check if we can still save more restaurants
    const currentMatch = matches[currentIndex % matches.length];
    const isDuplicate = savedRestaurants.find(r => r.restaurant.id === currentMatch.restaurant.id);
    const canSave = !isDuplicate && localSavedCountRef.current < 3;

    if (canSave) {
      forceSwipe('right');
    }
    // Otherwise do nothing - at limit or duplicate
  };

  const handleShuffle = () => {
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
      onShuffle();
    });
  };

  // Loop through restaurants instead of showing empty state
  const currentMatch = matches[currentIndex % matches.length];
  const nextMatch = matches[(currentIndex + 1) % matches.length];

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
      {/* Cards Stack */}
      <View style={styles.cardStack}>
        {/* Next card (background) */}
        {nextMatch && (
          <View style={[styles.cardWrapper, styles.nextCard]}>
            <GroupDinnerCard
              key={nextMatch.restaurant.id}
              match={nextMatch}
              savedCount={localSavedCount}
            />
          </View>
        )}

        {/* Current card */}
        <Animated.View
          style={[styles.cardWrapper, animatedCardStyle]}
          {...panResponder.panHandlers}
        >
          <GroupDinnerCard
            key={currentMatch.restaurant.id}
            match={currentMatch}
            onViewDetails={() => onCardPress(currentMatch)}
            savedCount={localSavedCount}
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
      </View>

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
