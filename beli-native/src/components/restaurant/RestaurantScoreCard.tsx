import React from 'react';
import { View, StyleSheet, ViewStyle, Text as RNText } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text, Caption } from '../typography';
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
  const radius = 45;
  const strokeWidth = 3;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const progress = (score / 10) * circumference;
  const strokeDashoffset = circumference - progress;

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.scoreColumn}>
        <View style={styles.scoreBubble}>
          <Svg height={radius * 2} width={radius * 2} style={styles.progressRing}>
            <Circle
              stroke={theme.colors.borderLight}
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <Circle
              stroke={resolvedAccent}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              transform={`rotate(-90 ${radius} ${radius})`}
            />
          </Svg>
          <View style={styles.scoreTextContainer}>
            <RNText style={[styles.scoreText, { color: resolvedAccent }]}>
              {score.toFixed(1)}
            </RNText>
          </View>
        </View>
        <Text style={styles.title}>
          {title}
        </Text>
        {description && (
          <Text style={styles.description}>
            {description}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  scoreColumn: {
    alignItems: 'center',
  },
  scoreBubble: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressRing: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  scoreTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 90,
  },
  scoreText: {
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: '700',
    fontSize: 24,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
