import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, shadows } from '../../theme';

interface ChallengeProgressCardProps {
  current: number;
  goal: number;
  daysLeft: number;
}

export default function ChallengeProgressCard({
  current,
  goal,
  daysLeft,
}: ChallengeProgressCardProps) {
  // Allow progress bar to show full even when over 100%
  const progress = Math.min(current / goal, 1);
  const isOverGoal = current > goal;

  return (
    <View style={styles.container}>
      <Text style={styles.mainText}>
        <Text style={styles.currentCount}>{current}</Text>
        <Text style={styles.goalText}> of {goal} restaurants</Text>
      </Text>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${progress * 100}%` }
          ]}
        />
      </View>

      <Text style={styles.daysLeft}>{daysLeft} days left</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    ...shadows.card,
  },
  mainText: {
    marginBottom: spacing.md,
  },
  currentCount: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  goalText: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.regular,
    color: colors.textPrimary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  daysLeft: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
});
