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
    styles.textBase,
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
    paddingVertical: 10, // Explicit vertical padding
    overflow: 'visible', // Ensure text isn't clipped
    ...theme.shadows.button,
  },

  // Variants
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: '#E5E5EA', // Light gray border to match design mockup
    ...theme.shadows.none,
  },
  text: {
    backgroundColor: 'transparent',
    ...theme.shadows.none,
  },

  // Sizes
  small: {
    height: 36,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
  },
  medium: {
    height: theme.spacing.buttonHeight,
    paddingVertical: 10,
  },
  large: {
    height: 52,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: 12,
  },

  // Disabled state
  disabled: {
    opacity: theme.animations.opacity.disabled,
  },

  // Text styles
  textBase: {
    textAlign: 'center',
    fontSize: 15, // Explicit fontSize
    fontWeight: '600', // Semibold - less bold than before, matches design mockup
    lineHeight: 20, // Explicit pixel lineHeight
    color: '#000000', // Fallback color
    includeFontPadding: false, // Android: remove extra padding
  },
  primaryText: {
    color: '#FFFFFF', // Explicit white
  },
  secondaryText: {
    color: '#000000', // Explicit black
  },
  textText: {
    color: theme.colors.primary,
  },

  // Size-specific text styles
  smallText: {
    fontSize: 13,
    lineHeight: 18,
  },
  mediumText: {
    fontSize: 15,
    lineHeight: 20,
  },
  largeText: {
    fontSize: 17,
    lineHeight: 22,
  },

  disabledText: {
    opacity: 1, // Keep text opacity normal, button opacity handles disabled state
  },
});