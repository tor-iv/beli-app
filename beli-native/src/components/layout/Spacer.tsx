import React from 'react';
import { View, ViewStyle } from 'react-native';
import { theme } from '../../theme';

// Extract numeric spacing keys (excluding borderRadius which is an object)
type NumericSpacingKey = Exclude<keyof typeof theme.spacing, 'borderRadius'>;

interface SpacerProps {
  size?: NumericSpacingKey | number;
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
  const spacingValue = typeof size === 'number' ? size : theme.spacing[size] as number;

  const spacerStyle: ViewStyle = horizontal
    ? { width: spacingValue }
    : { height: spacingValue };

  return <View style={[spacerStyle, style]} testID={testID} />;
};