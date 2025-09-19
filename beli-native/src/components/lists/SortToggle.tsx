import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { Text } from '../typography';
import { theme } from '../../theme';

interface SortToggleProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onPress: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const SortToggle: React.FC<SortToggleProps> = ({
  sortBy,
  sortOrder,
  onPress,
  style,
  testID,
}) => {
  const ArrowIcon = ({ direction }: { direction: 'up' | 'down' }) => (
    <Text
      variant="caption"
      color="textSecondary"
      style={[
        styles.arrow,
        direction === 'up' && styles.arrowUp,
      ]}
    >
      {direction === 'up' ? '▲' : '▼'}
    </Text>
  );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && {
          opacity: theme.animations.opacity.pressed,
        },
        style,
      ]}
      onPress={onPress}
      testID={testID}
    >
      <Text variant="bodySmall" color="textPrimary" style={styles.label}>
        {sortBy}
      </Text>
      <View style={styles.arrows}>
        <ArrowIcon direction="up" />
        <ArrowIcon direction="down" />
      </View>
      <View style={[
        styles.indicator,
        sortOrder === 'asc' ? styles.indicatorUp : styles.indicatorDown,
      ]} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.borderRadius.sm,
    ...theme.shadows.button,
  },

  label: {
    fontWeight: theme.typography.weights.medium,
    marginRight: theme.spacing.xs,
  },

  arrows: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.xs,
  },

  arrow: {
    fontSize: 8,
    lineHeight: 10,
    opacity: 0.5,
  },

  arrowUp: {
    marginBottom: 1,
  },

  indicator: {
    width: 2,
    height: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 1,
    marginLeft: theme.spacing.xs,
  },

  indicatorUp: {
    alignSelf: 'flex-start',
  },

  indicatorDown: {
    alignSelf: 'flex-end',
  },
});