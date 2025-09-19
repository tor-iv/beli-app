import React from 'react';
import { View, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface SpacerProps {
  size?: keyof typeof theme.spacing | number;
  horizontal?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const Spacer: React.FC<SpacerProps> = ({
  size = 'md',
  horizontal = false,
  style,
  testID,
}) => {
  const spacingValue = typeof size === 'number' ? size : theme.spacing[size];

  const spacerStyle: ViewStyle = {
    ...(horizontal ? { width: spacingValue } : { height: spacingValue }),
  };

  return <View style={[spacerStyle, style]} testID={testID} />;
};