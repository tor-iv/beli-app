import React from 'react';
import { Text as RNText, StyleSheet, TextStyle } from 'react-native';
import { theme, TextStyleKey, ColorKey } from '../../theme';

interface TextProps {
  children: React.ReactNode;
  variant?: TextStyleKey;
  color?: ColorKey | string;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  style?: TextStyle;
  testID?: string;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color = 'textPrimary',
  align = 'left',
  numberOfLines,
  style,
  testID,
}) => {
  const textStyle = [
    styles.base,
    theme.typography.textStyles[variant],
    {
      color: color in theme.colors ? theme.colors[color as ColorKey] : color,
      textAlign: align,
    },
    style,
  ];

  return (
    <RNText
      style={textStyle}
      numberOfLines={numberOfLines}
      testID={testID}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: theme.typography.fontFamily.primary,
  },
});