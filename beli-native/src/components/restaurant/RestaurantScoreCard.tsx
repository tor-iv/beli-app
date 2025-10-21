import React from 'react';
import { View, StyleSheet, ViewStyle, Text as RNText } from 'react-native';
import { theme } from '../../theme';

interface RestaurantScoreCardProps {
  score: number;
  title: string;
  description?: string;
  descriptionNode?: React.ReactNode;
  sampleSize?: number;
  accentColor?: string;
  indicatorColor?: string;
  style?: ViewStyle;
  testID?: string;
}

const formatSampleSize = (value?: number): string | undefined => {
  if (!value || value <= 0) {
    return undefined;
  }

  if (value >= 1000) {
    return `${Math.round(value / 1000)}k`;
  }

  return `${value}`;
};

const getScoreColor = (score: number): string => {
  if (score >= 8.5) return theme.colors.ratingExcellent;
  if (score >= 7.0) return theme.colors.ratingGood;
  if (score >= 5.0) return theme.colors.ratingAverage;
  return theme.colors.ratingPoor;
};

export const RestaurantScoreCard: React.FC<RestaurantScoreCardProps> = ({
  score,
  title,
  description,
  descriptionNode,
  sampleSize,
  accentColor,
  indicatorColor,
  style,
  testID,
}) => {
  const formattedSample = formatSampleSize(sampleSize);
  const resolvedAccent = accentColor ?? getScoreColor(score);

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Score Circle */}
      <View style={styles.scoreCircleContainer}>
        <View style={styles.scoreCircle}>
          <RNText style={[styles.scoreText, { color: resolvedAccent }]}>
            {score.toFixed(1)}
          </RNText>
        </View>
        {/* Sample Size Badge */}
        {formattedSample && (
          <View style={styles.sampleBadge}>
            <RNText style={styles.sampleText}>
              {formattedSample}
            </RNText>
          </View>
        )}
      </View>

      {/* Title and Description */}
      <View style={styles.textColumn}>
        <RNText style={styles.title}>
          {title}
        </RNText>
        {description && (
          <RNText style={styles.description}>
            {description}
          </RNText>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: 240,
    overflow: 'visible',
  },
  scoreCircleContainer: {
    position: 'relative',
    overflow: 'visible',
  },
  scoreCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#E5E5E7',
    backgroundColor: theme.colors.cardWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: '700',
    fontSize: 24,
  },
  sampleBadge: {
    position: 'absolute',
    bottom: -4,
    right: -6,
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    minWidth: 24,
    alignItems: 'center',
  },
  sampleText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textInverse,
  },
  textColumn: {
    flex: 1,
    flexShrink: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
    flexWrap: 'wrap',
  },
});
