import React from 'react';
import { View, StyleSheet, ViewStyle, SafeAreaView } from 'react-native';
import { Text } from '../typography';
import { IconButton } from '../base';
import { theme } from '../../theme';

interface HeaderBarProps {
  title?: string;
  subtitle?: string;
  leftButton?: {
    icon: React.ReactNode;
    onPress: () => void;
  };
  rightButton?: {
    icon: React.ReactNode;
    onPress: () => void;
  };
  showShadow?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  leftButton,
  rightButton,
  showShadow = true,
  style,
  testID,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.container,
          showShadow && styles.withShadow,
          style,
        ]}
        testID={testID}
      >
        {/* Left Section */}
        <View style={styles.leftSection}>
          {leftButton ? (
            <IconButton
              onPress={leftButton.onPress}
              size="medium"
              variant="ghost"
            >
              {leftButton.icon}
            </IconButton>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        {/* Center Section */}
        <View style={styles.centerSection}>
          {title && (
            <Text
              variant="h4"
              color="textPrimary"
              align="center"
              numberOfLines={1}
              style={styles.title}
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              variant="caption"
              color="textSecondary"
              align="center"
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          {rightButton ? (
            <IconButton
              onPress={rightButton.onPress}
              size="medium"
              variant="ghost"
            >
              {rightButton.icon}
            </IconButton>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.white,
  },

  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.edgePadding,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    minHeight: theme.spacing.headerHeight,
  },

  withShadow: {
    ...theme.shadows.header,
  },

  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },

  centerSection: {
    flex: 2,
    alignItems: 'center',
  },

  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },

  placeholder: {
    width: 40, // Same as IconButton size
    height: 40,
  },

  title: {
    fontWeight: theme.typography.weights.semibold,
  },
});