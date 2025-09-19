import React from 'react';
import { Text } from './Text';
import { TextStyle } from 'react-native';
import { ColorKey } from '../../theme';

interface CaptionProps {
  children: React.ReactNode;
  variant?: 'caption' | 'metadata';
  color?: ColorKey | string;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  style?: TextStyle;
  testID?: string;
}

export const Caption: React.FC<CaptionProps> = ({
  children,
  variant = 'caption',
  color = 'textSecondary',
  align = 'left',
  numberOfLines,
  style,
  testID,
}) => {
  return (
    <Text
      variant={variant}
      color={color}
      align={align}
      numberOfLines={numberOfLines}
      style={style}
      testID={testID}
    >
      {children}
    </Text>
  );
};