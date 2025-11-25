import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable, StyleProp } from 'react-native';
import { theme } from '../../theme';

// Extract numeric spacing keys (excluding borderRadius which is an object)
type NumericSpacingKey = Exclude<keyof typeof theme.spacing, 'borderRadius'>;

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: NumericSpacingKey | number;
  margin?: NumericSpacingKey | number;
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
  // Compute padding value
  const paddingValue = typeof padding === 'number'
    ? padding
    : theme.spacing[padding] as number;

  // Compute margin value if provided
  const marginValue = margin
    ? (typeof margin === 'number' ? margin : theme.spacing[margin] as number)
    : undefined;

  // Build the base card style
  const baseCardStyle: ViewStyle = {
    ...styles.base,
    ...styles[variant],
    padding: paddingValue,
    ...(marginValue !== undefined && { margin: marginValue }),
    ...style,
  };

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }): StyleProp<ViewStyle> => [
          baseCardStyle,
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
    <View style={baseCardStyle} testID={testID}>
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