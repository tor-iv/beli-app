import React from 'react';
import { Text } from './Text';
import { TextStyle } from 'react-native';
import { ColorKey } from '../../theme';

interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4;
  color?: ColorKey | string;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  style?: TextStyle;
  testID?: string;
}

const HEADING_VARIANTS = {
  1: 'h1' as const,
  2: 'h2' as const,
  3: 'h3' as const,
  4: 'h4' as const,
};

export const Heading: React.FC<HeadingProps> = ({
  children,
  level = 1,
  color = 'textPrimary',
  align = 'left',
  numberOfLines,
  style,
  testID,
}) => {
  return (
    <Text
      variant={HEADING_VARIANTS[level]}
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