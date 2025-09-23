import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable, Text as RNText } from 'react-native';
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
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && {
          opacity: 0.7,
        },
        style,
      ]}
      onPress={onPress}
      testID={testID}
    >
      <View style={styles.labelContainer}>
        <RNText style={[styles.arrow, sortOrder === 'asc' && styles.arrowAsc]}>
          ↕
        </RNText>
        <Text style={styles.labelText}>{sortBy}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  arrow: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
    color: theme.colors.primary,
  },

  arrowAsc: {
    transform: [{ rotate: '180deg' }],
  },

  labelText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
    letterSpacing: 0.2,
  },
});
