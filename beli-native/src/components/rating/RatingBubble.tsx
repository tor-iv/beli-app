import React from 'react';
import { View, StyleSheet, ViewStyle, Text as RNText } from 'react-native';
import { Text } from '../typography';
import { theme } from '../../theme';

interface RatingBubbleProps {
  rating: number;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  testID?: string;
}

const BUBBLE_SIZES = {
  small: 32,
  medium: 44,
  large: 56,
};

const getRatingColor = (rating: number): string => {
  if (rating >= 8.5) return theme.colors.ratingExcellent;  // 8.5+ Bright green
  if (rating >= 7.0) return theme.colors.ratingGood;       // 7.0-8.4 Light green
  if (rating >= 5.0) return theme.colors.ratingAverage;    // 5.0-6.9 Amber/Yellow
  return theme.colors.ratingPoor;                          // Below 5.0 Red
};

export const RatingBubble: React.FC<RatingBubbleProps> = ({
  rating,
  size = 'medium',
  style,
  testID,
}) => {
  const bubbleSize = BUBBLE_SIZES[size];
  const textColor = getRatingColor(rating);

  const bubbleStyle = [
    styles.bubble,
    {
      width: bubbleSize,
      height: bubbleSize,
      borderRadius: bubbleSize / 2,
      backgroundColor: theme.colors.white,
      borderWidth: 1.5,
      borderColor: '#D9D9DE',
    },
    style,
  ];

  const getFontSize = (size: 'small' | 'medium' | 'large'): number => {
    switch (size) {
      case 'small': return 12;
      case 'large': return 18;
      default: return 14;
    }
  };

  return (
    <View style={bubbleStyle} testID={testID}>
      <RNText
        style={{
          color: textColor,
          fontSize: getFontSize(size),
          fontWeight: '700',
          fontFamily: theme.typography.fontFamily.primary,
          textAlign: 'center',
          lineHeight: getFontSize(size) * 1.1,
        }}
      >
        {rating.toFixed(1)}
      </RNText>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    // Remove shadows for clean outline design
  },
});
