import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface ViewMapButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  testID?: string;
  variant?: 'inline' | 'floating';
}

export const ViewMapButton: React.FC<ViewMapButtonProps> = ({
  onPress,
  style,
  testID,
  variant = 'inline',
}) => {
  const isFloating = variant === 'floating';

  return (
    <View
      style={[
        styles.container,
        isFloating ? styles.floatingContainer : styles.inlineContainer,
        style,
      ]}
      pointerEvents={isFloating ? 'box-none' : 'auto'}
      testID={testID}
    >
      <Pressable
        style={({ pressed }) => [
          styles.button,
          isFloating ? styles.floatingButton : styles.inlineButton,
          pressed && (isFloating ? styles.buttonPressedFloating : styles.buttonPressedInline),
        ]}
        onPress={onPress}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="map-outline" size={18} color={theme.colors.white} />
        </View>
        <Text style={styles.text}>View Map</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.md,
  },

  floatingContainer: {
    position: 'absolute',
    bottom: theme.spacing.md,
    right: theme.spacing.edgePadding,
    zIndex: 1000,
  },

  inlineContainer: {
    alignItems: 'flex-end',
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.spacing.borderRadius.full,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'center',
  },

  inlineButton: {
    minWidth: 144,
  },

  floatingButton: {
    minWidth: 148,
  },

  buttonPressedFloating: {
    backgroundColor: theme.colors.primaryDark || theme.colors.primary,
    transform: [{ scale: 0.95 }],
  },

  buttonPressedInline: {
    backgroundColor: theme.colors.primaryDark || theme.colors.primary,
  },

  iconContainer: {
    marginRight: theme.spacing.sm,
  },

  text: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: theme.typography.weights.semibold,
  },
});
