import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated, Dimensions } from 'react-native';
import { Text } from '../typography';
import { theme } from '../../theme';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
  duration?: number;
  onHide?: () => void;
  style?: ViewStyle;
  testID?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  visible,
  duration = 3000,
  onHide,
  style,
  testID,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: theme.animations.duration.normal,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: theme.animations.duration.normal,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: theme.animations.duration.fast,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: theme.animations.duration.fast,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  const getToastIcon = (): string => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getToastColor = (): string => {
    switch (type) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'info':
      default:
        return theme.colors.info;
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          borderLeftColor: getToastColor(),
        },
        style,
      ]}
      testID={testID}
    >
      <Text style={styles.icon}>{getToastIcon()}</Text>
      <Text
        variant="body"
        color="textPrimary"
        style={styles.message}
        numberOfLines={2}
      >
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // Below safe area
    left: theme.spacing.edgePadding,
    right: theme.spacing.edgePadding,
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.borderRadius.md,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    zIndex: 1000,
    ...theme.shadows.toast,
  },

  icon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },

  message: {
    flex: 1,
    lineHeight: 20,
  },
});