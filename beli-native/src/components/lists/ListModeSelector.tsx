import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, typography } from '../../theme';

type ListMode = 'my-lists' | 'tastemakers';

interface ListModeSelectorProps {
  mode: ListMode;
  onModeChange: (mode: ListMode) => void;
}

export default function ListModeSelector({ mode, onModeChange }: ListModeSelectorProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.segment,
          styles.segmentLeft,
          mode === 'my-lists' && styles.segmentActive,
        ]}
        onPress={() => onModeChange('my-lists')}
      >
        <Text
          style={[
            styles.segmentText,
            mode === 'my-lists' && styles.segmentTextActive,
          ]}
        >
          My Lists
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.segment,
          styles.segmentRight,
          mode === 'tastemakers' && styles.segmentActive,
        ]}
        onPress={() => onModeChange('tastemakers')}
      >
        <Text
          style={[
            styles.segmentText,
            mode === 'tastemakers' && styles.segmentTextActive,
          ]}
        >
          Tastemakers
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: 8,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  segmentLeft: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  segmentRight: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.white,
  },
});
