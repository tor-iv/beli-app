import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

interface AchievementBannerProps {
  emoji: string;
  text: string;
  progress?: number; // 0-1
  daysLeft?: number;
  onSetNewGoal?: () => void;
}

export const AchievementBanner: React.FC<AchievementBannerProps> = ({
  emoji,
  text,
  progress = 1,
  daysLeft,
  onSetNewGoal,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.text}>{text}</Text>
      </View>

      {progress !== undefined && (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
      )}

      <View style={styles.footer}>
        {daysLeft !== undefined && (
          <Text style={styles.daysLeft}>{daysLeft} days left</Text>
        )}
        {onSetNewGoal && (
          <TouchableOpacity onPress={onSetNewGoal} style={styles.button}>
            <Text style={styles.buttonText}>Set a new goal</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emoji: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  text: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.regular,
    color: colors.textPrimary,
    flex: 1,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  daysLeft: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  buttonText: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
});
