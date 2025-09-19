import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Heading } from '../typography';
import { theme } from '../../theme';

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  spacing?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  testID?: string;
}

const SPACING_MAP = {
  none: 0,
  small: theme.spacing.md,
  medium: theme.spacing.lg,
  large: theme.spacing.sectionSpacing,
};

export const Section: React.FC<SectionProps> = ({
  children,
  title,
  subtitle,
  headerAction,
  spacing = 'medium',
  style,
  testID,
}) => {
  const hasHeader = title || subtitle || headerAction;

  return (
    <View
      style={[
        styles.section,
        {
          marginBottom: SPACING_MAP[spacing],
        },
        style,
      ]}
      testID={testID}
    >
      {hasHeader && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title && (
              <Heading level={3} style={styles.title}>
                {title}
              </Heading>
            )}
            {subtitle && (
              <Heading level={4} color="textSecondary" style={styles.subtitle}>
                {subtitle}
              </Heading>
            )}
          </View>
          {headerAction && (
            <View style={styles.headerAction}>
              {headerAction}
            </View>
          )}
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    // Base section styles
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.edgePadding,
  },

  headerText: {
    flex: 1,
  },

  title: {
    marginBottom: theme.spacing.xs,
  },

  subtitle: {
    fontWeight: theme.typography.weights.regular,
  },

  headerAction: {
    marginLeft: theme.spacing.md,
  },

  content: {
    // Content container
  },
});