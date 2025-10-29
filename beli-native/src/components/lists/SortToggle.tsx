import React from 'react';
import { StyleSheet, ViewStyle, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
          opacity: 0.6,
        },
        style,
      ]}
      onPress={onPress}
      testID={testID}
    >
      <View style={styles.content}>
        <Ionicons
          name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
          size={14}
          color={theme.colors.textSecondary}
          style={styles.arrowIcon}
        />
        <Text style={styles.labelText}>{sortBy}</Text>
        <Ionicons
          name="chevron-down"
          size={14}
          color={theme.colors.textSecondary}
          style={styles.chevronIcon}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.xs,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  arrowIcon: {
    marginRight: 2,
  },

  chevronIcon: {
    marginLeft: 2,
  },

  labelText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.regular,
  },
});
