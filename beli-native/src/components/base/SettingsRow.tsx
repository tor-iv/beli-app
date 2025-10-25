import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

interface SettingsRowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBackgroundColor?: string;
  title: string;
  subtitle?: string;
  value?: string;
  type: 'navigation' | 'toggle' | 'info';
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  disabled?: boolean;
  badge?: number;
}

export default function SettingsRow({
  icon,
  iconColor = colors.textSecondary,
  iconBackgroundColor,
  title,
  subtitle,
  value,
  type,
  toggleValue = false,
  onToggle,
  onPress,
  destructive = false,
  showChevron = true,
  disabled = false,
  badge,
}: SettingsRowProps) {
  const renderContent = () => (
    <View style={styles.container}>
      {/* Icon */}
      {icon && (
        <View
          style={[
            styles.iconContainer,
            iconBackgroundColor && { backgroundColor: iconBackgroundColor },
          ]}
        >
          <Ionicons
            name={icon}
            size={24}
            color={destructive ? colors.error : iconColor}
          />
        </View>
      )}

      {/* Text Container */}
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            destructive && styles.destructiveText,
            disabled && styles.disabledText,
          ]}
        >
          {title}
        </Text>
        {value && <Text style={styles.value}>{value}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {/* Right Side Controls */}
      {type === 'toggle' && (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.borderMedium, true: colors.primary }}
          thumbColor={colors.cardWhite}
          ios_backgroundColor={colors.borderMedium}
          disabled={disabled}
        />
      )}

      {type === 'navigation' && showChevron && (
        <>
          {badge !== undefined && badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </>
      )}
    </View>
  );

  if (type === 'info' || type === 'toggle') {
    return <View style={styles.wrapper}>{renderContent()}</View>;
  }

  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 60,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.textStyles.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  value: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  destructiveText: {
    color: colors.error,
  },
  disabledText: {
    color: colors.textTertiary,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: 8,
  },
  badgeText: {
    color: colors.cardWhite,
    fontSize: 12,
    fontWeight: '600',
  },
});
