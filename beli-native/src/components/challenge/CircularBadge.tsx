import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';

interface CircularBadgeProps {
  year: number;
  size?: number;
}

export default function CircularBadge({ year, size = 140 }: CircularBadgeProps) {
  const innerSize = size * 0.78;
  const borderWidth = 3;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer ring */}
      <View
        style={[
          styles.outerRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: borderWidth,
          },
        ]}
      />
      {/* Inner circle */}
      <View
        style={[
          styles.innerCircle,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}
      >
        <Text style={styles.year}>{year}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
    borderColor: colors.primary,
    opacity: 0.3,
  },
  innerCircle: {
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  year: {
    fontSize: 32,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: -0.5,
  },
});
