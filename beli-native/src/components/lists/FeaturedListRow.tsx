import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

interface FeaturedListRowProps {
  title: string;
  description: string;
  thumbnailImage: string;
  progressText: string;
  onPress?: () => void;
  isLast?: boolean;
}

export const FeaturedListRow: React.FC<FeaturedListRowProps> = ({
  title,
  description,
  thumbnailImage,
  progressText,
  onPress,
  isLast = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isLast && styles.lastContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: thumbnailImage }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.textContent}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        <Text style={styles.progressText}>{progressText}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.textTertiary}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  lastContainer: {
    borderBottomWidth: 0,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: spacing.borderRadius.md,
    marginRight: spacing.md,
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  progressText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
});
