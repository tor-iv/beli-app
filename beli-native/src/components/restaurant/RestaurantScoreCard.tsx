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
      <View style={styles.scoreColumn}>
        {/* Score Circle */}
        <View style={styles.scoreCircleContainer}>
          <View style={[styles.scoreCircle, { backgroundColor: resolvedAccent }]}>
            <RNText style={styles.scoreText}>
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

        {/* Title */}
        <RNText style={styles.title}>
          {title}
        </RNText>

        {/* Description */}
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
    width: 160,
    height: 100,
    backgroundColor: theme.colors.cardWhite,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 16,
    padding: 16,
  },
  scoreColumn: {
    alignItems: 'flex-start',
    flex: 1,
  },
  scoreCircleContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  scoreCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: '700',
    fontSize: 24,
    color: theme.colors.textInverse,
  },
  sampleBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  sampleText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textInverse,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'left',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'left',
    lineHeight: 16,
  },
});
