import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

interface ProfileStatCardProps {
  icon: 'trophy' | 'flame';
  label: string;
  value: string;
  iconColor?: string;
}

export const ProfileStatCard: React.FC<ProfileStatCardProps> = ({
  icon,
  label,
  value,
  iconColor,
}) => {
  return (
    <View style={styles.container}>
      <Ionicons
        name={icon}
        size={32}
        color={iconColor || colors.primary}
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    flex: 1,
  },
  icon: {
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  value: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
});
