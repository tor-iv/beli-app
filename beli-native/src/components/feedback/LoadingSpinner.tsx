import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../typography';
import { theme } from '../../theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = theme.colors.primary,
  text,
  overlay = false,
  style,
  testID,
}) => {
  const content = (
    <View style={[styles.container, style]} testID={testID}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text
          variant="body"
          color="textSecondary"
          align="center"
          style={styles.text}
        >
          {text}
        </Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <View style={styles.overlay}>
        <View style={styles.overlayContent}>
          {content}
        </View>
      </View>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },

  text: {
    marginTop: theme.spacing.md,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },

  overlayContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.borderRadius.md,
    padding: theme.spacing.xl,
    ...theme.shadows.modal,
  },
});