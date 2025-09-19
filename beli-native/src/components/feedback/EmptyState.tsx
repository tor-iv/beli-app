import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, Heading } from '../typography';
import { Button } from '../base';
import { theme } from '../../theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🍽️',
  title,
  description,
  actionLabel,
  onAction,
  style,
  testID,
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      <Text style={styles.icon}>{icon}</Text>

      <Heading level={3} align="center" style={styles.title}>
        {title}
      </Heading>

      {description && (
        <Text
          variant="body"
          color="textSecondary"
          align="center"
          style={styles.description}
        >
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={styles.action}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },

  icon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
    opacity: 0.5,
  },

  title: {
    marginBottom: theme.spacing.sm,
  },

  description: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },

  action: {
    minWidth: 200,
  },
});