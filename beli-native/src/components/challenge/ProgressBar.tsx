import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';

interface ProgressBarProps {
  progress: number; // 0-100+ percentage
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  animated?: boolean;
  animationDuration?: number;
}

export default function ProgressBar({
  progress,
  height = 12,
  backgroundColor = colors.borderLight,
  progressColor = colors.primary,
  animated = true,
  animationDuration = 800,
}: ProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: Math.min(progress, 100), // Cap at 100% visually
        duration: animationDuration,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(Math.min(progress, 100));
    }
  }, [progress, animated, animationDuration, animatedWidth]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { height, backgroundColor, borderRadius: height / 2 }]}>
      <Animated.View
        style={[
          styles.progress,
          {
            width: widthInterpolation,
            height,
            backgroundColor: progressColor,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  progress: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
