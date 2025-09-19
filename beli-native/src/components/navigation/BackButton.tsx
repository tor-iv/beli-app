import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { IconButton } from '../base';
import { Text } from '../typography';
import { theme } from '../../theme';

interface BackButtonProps {
  onPress: () => void;
  variant?: 'icon' | 'text';
  text?: string;
  style?: ViewStyle;
  testID?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  variant = 'icon',
  text = 'Back',
  style,
  testID,
}) => {
  const BackIcon = () => (
    <Text style={styles.icon}>←</Text>
  );

  if (variant === 'text') {
    return (
      <IconButton
        onPress={onPress}
        variant="ghost"
        style={[styles.textButton, style]}
        testID={testID}
      >
        <Text variant="body" color="primary" style={styles.backText}>
          ← {text}
        </Text>
      </IconButton>
    );
  }

  return (
    <IconButton
      onPress={onPress}
      size="medium"
      variant="ghost"
      style={style}
      testID={testID}
    >
      <BackIcon />
    </IconButton>
  );
};

const styles = StyleSheet.create({
  icon: {
    fontSize: 20,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.semibold,
  },

  textButton: {
    width: 'auto',
    paddingHorizontal: theme.spacing.sm,
  },

  backText: {
    fontWeight: theme.typography.weights.medium,
  },
});