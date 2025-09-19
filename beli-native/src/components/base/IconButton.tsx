import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface IconButtonProps {
  children: React.ReactNode; // Icon component
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'primary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const BUTTON_SIZES = {
  small: 32,
  medium: 40,
  large: 48,
};

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  onPress,
  size = 'medium',
  variant = 'default',
  disabled = false,
  style,
  testID,
}) => {
  const buttonSize = BUTTON_SIZES[size];

  const buttonStyle = [
    styles.base,
    styles[variant],
    {
      width: buttonSize,
      height: buttonSize,
      borderRadius: buttonSize / 2,
    },
    disabled && styles.disabled,
    style,
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        buttonStyle,
        pressed && !disabled && {
          opacity: theme.animations.opacity.pressed,
          transform: [{ scale: theme.animations.scale.press }],
        },
      ]}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  default: {
    backgroundColor: theme.colors.white,
    ...theme.shadows.button,
  },

  primary: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.button,
  },

  ghost: {
    backgroundColor: 'transparent',
  },

  disabled: {
    opacity: theme.animations.opacity.disabled,
  },
});