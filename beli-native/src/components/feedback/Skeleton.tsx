import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated, DimensionValue } from 'react-native';
import { theme } from '../../theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  testID?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = theme.spacing.borderRadius.xs,
  style,
  testID,
}) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerValue]);

  const shimmerOpacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  // Build dimension style object
  const dimensionStyle: ViewStyle = {
    width,
    height,
    borderRadius,
  };

  return (
    <View
      style={[styles.skeleton, dimensionStyle, style]}
      testID={testID}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            borderRadius,
            opacity: shimmerOpacity,
          },
        ]}
      />
    </View>
  );
};

// Preset skeleton components for common use cases
export const SkeletonText: React.FC<{
  lines?: number;
  style?: ViewStyle;
}> = ({ lines = 1, style }) => (
  <View style={[styles.textContainer, style]}>
    {Array.from({ length: lines }, (_, index) => (
      <Skeleton
        key={index}
        height={16}
        width={index === lines - 1 ? '70%' : '100%'}
        style={index > 0 ? { marginTop: 8 } : undefined}
      />
    ))}
  </View>
);

export const SkeletonAvatar: React.FC<{
  size?: number;
  style?: ViewStyle;
}> = ({ size = 44, style }) => (
  <Skeleton
    width={size}
    height={size}
    borderRadius={size / 2}
    style={style}
  />
);

export const SkeletonCard: React.FC<{
  style?: ViewStyle;
}> = ({ style }) => (
  <View style={[styles.card, style]}>
    <Skeleton height={120} borderRadius={theme.spacing.borderRadius.md} />
    <View style={styles.cardContent}>
      <Skeleton height={20} width="60%" />
      <Skeleton height={16} width="40%" style={{ marginTop: 8 }} />
      <Skeleton height={14} width="80%" style={{ marginTop: 8 }} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.borderLight,
    overflow: 'hidden',
  },

  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.shimmer,
  },

  textContainer: {
    // Container for text skeletons
  },

  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.borderRadius.md,
    ...theme.shadows.card,
    marginBottom: theme.spacing.cardMargin,
  },

  cardContent: {
    padding: theme.spacing.cardPadding,
  },
});