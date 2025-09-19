import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { theme } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof theme.spacing | number;
  margin?: keyof typeof theme.spacing | number;
  style?: ViewStyle;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  variant = 'default',
  padding = 'cardPadding',
  margin,
  style,
  testID,
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    {
      padding: typeof padding === 'number' ? padding : theme.spacing[padding],
      ...(margin && {
        margin: typeof margin === 'number' ? margin : theme.spacing[margin],
      }),
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          cardStyle,
          pressed && {
            transform: [{ scale: theme.animations.scale.press }],
            opacity: theme.animations.opacity.pressed,
          },
        ]}
        onPress={onPress}
        testID={testID}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.spacing.borderRadius.md,
    backgroundColor: theme.colors.cardBackground,
  },

  default: {
    ...theme.shadows.card,
  },

  elevated: {
    ...theme.shadows.cardElevated,
  },

  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.none,
  },
});