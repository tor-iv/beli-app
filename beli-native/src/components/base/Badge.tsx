import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../theme';

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  testID,
}) => {
  const badgeStyle = [
    styles.base,
    styles[variant],
    styles[size],
    style,
  ];

  const labelStyle = [
    styles.text,
    styles[`${size}Text`],
    styles[`${variant}Text`],
    textStyle,
  ];

  return (
    <View style={badgeStyle} testID={testID}>
      <Text style={labelStyle}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Base styles
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.spacing.borderRadius.xl,
    paddingHorizontal: theme.spacing.sm,
  },

  // Variants
  primary: {
    backgroundColor: theme.colors.primary,
  },
  success: {
    backgroundColor: theme.colors.success,
  },
  warning: {
    backgroundColor: theme.colors.warning,
  },
  error: {
    backgroundColor: theme.colors.error,
  },
  info: {
    backgroundColor: theme.colors.info,
  },
  neutral: {
    backgroundColor: theme.colors.textSecondary,
  },

  // Sizes
  small: {
    height: 20,
    paddingHorizontal: theme.spacing.xs,
  },
  medium: {
    height: 24,
  },
  large: {
    height: 32,
    paddingHorizontal: theme.spacing.md,
  },

  // Text styles
  text: {
    fontWeight: theme.typography.weights.semibold,
    textAlign: 'center',
  },

  // Variant text colors
  primaryText: {
    color: theme.colors.textInverse,
  },
  successText: {
    color: theme.colors.textInverse,
  },
  warningText: {
    color: theme.colors.textPrimary,
  },
  errorText: {
    color: theme.colors.textInverse,
  },
  infoText: {
    color: theme.colors.textInverse,
  },
  neutralText: {
    color: theme.colors.textInverse,
  },

  // Size-specific text styles
  smallText: {
    fontSize: theme.typography.sizes.xs,
  },
  mediumText: {
    fontSize: theme.typography.sizes.sm,
  },
  largeText: {
    fontSize: theme.typography.sizes.base,
  },
});