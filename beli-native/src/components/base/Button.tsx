import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={theme.animations.opacity.pressed}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? theme.colors.white : theme.colors.primary}
        />
      ) : (
        <Text style={labelStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base styles
  base: {
    borderRadius: theme.spacing.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    ...theme.shadows.button,
  },

  // Variants
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  text: {
    backgroundColor: 'transparent',
  },

  // Sizes
  small: {
    height: 36,
    paddingHorizontal: theme.spacing.md,
  },
  medium: {
    height: theme.spacing.buttonHeight,
  },
  large: {
    height: 52,
    paddingHorizontal: theme.spacing.xl,
  },

  // Disabled state
  disabled: {
    opacity: theme.animations.opacity.disabled,
  },

  // Text styles
  text: {
    textAlign: 'center',
    ...theme.typography.textStyles.button,
  },
  primaryText: {
    color: theme.colors.textInverse,
  },
  secondaryText: {
    color: theme.colors.primary,
  },
  textText: {
    color: theme.colors.primary,
  },

  // Size-specific text styles
  smallText: {
    fontSize: theme.typography.sizes.sm,
  },
  mediumText: {
    fontSize: theme.typography.sizes.base,
  },
  largeText: {
    ...theme.typography.textStyles.buttonLarge,
  },

  disabledText: {
    opacity: 1, // Keep text opacity normal, button opacity handles disabled state
  },
});