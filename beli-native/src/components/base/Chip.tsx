import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../theme';

interface ChipProps {
  label: string;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'outlined' | 'filter';
  size?: 'small' | 'medium';
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  onPress,
  selected = false,
  disabled = false,
  variant = 'default',
  size = 'medium',
  style,
  textStyle,
  testID,
}) => {
  const isInteractive = Boolean(onPress);

  const chipStyle = [
    styles.base,
    styles[variant],
    styles[size],
    selected && styles.selected,
    disabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    selected && styles.selectedText,
    disabled && styles.disabledText,
    textStyle,
  ];

  if (isInteractive) {
    return (
      <Pressable
        style={({ pressed }) => [
          chipStyle,
          pressed && {
            opacity: theme.animations.opacity.pressed,
            transform: [{ scale: theme.animations.scale.press }],
          },
        ]}
        onPress={onPress}
        disabled={disabled}
        testID={testID}
      >
        <Text style={labelStyle}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable style={chipStyle} testID={testID}>
      <Text style={labelStyle}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // Base styles
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.spacing.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
  },

  // Variants
  default: {
    backgroundColor: theme.colors.borderLight,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.borderMedium,
  },
  filter: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.button,
  },

  // Sizes
  small: {
    height: 28,
    paddingHorizontal: theme.spacing.sm,
  },
  medium: {
    height: 32,
  },

  // States
  selected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  disabled: {
    opacity: theme.animations.opacity.disabled,
  },

  // Text styles
  text: {
    fontWeight: theme.typography.weights.medium,
    textAlign: 'center',
  },

  // Variant text colors
  defaultText: {
    color: theme.colors.textPrimary,
  },
  outlinedText: {
    color: theme.colors.textPrimary,
  },
  filterText: {
    color: theme.colors.textPrimary,
  },

  // Size-specific text styles
  smallText: {
    fontSize: theme.typography.sizes.xs,
  },
  mediumText: {
    fontSize: theme.typography.sizes.sm,
  },

  // State text styles
  selectedText: {
    color: theme.colors.textInverse,
  },
  disabledText: {
    opacity: 1, // Keep text opacity normal, chip opacity handles disabled state
  },
});