import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { Text } from '../typography';
import { theme } from '../../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  autoFocus?: boolean;
  editable?: boolean;
  showIcon?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search restaurants, cuisine, occasion',
  onFocus,
  onBlur,
  onClear,
  autoFocus = false,
  editable = true,
  showIcon = true,
  style,
  testID,
}) => {
  const SearchIcon = () => (
    <Text style={styles.icon}>🔍</Text>
  );

  const ClearIcon = () => (
    <Pressable
      onPress={onClear}
      style={styles.clearButton}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={styles.clearIcon}>✕</Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, style]} testID={testID}>
      {showIcon && (
        <View style={styles.iconContainer}>
          <SearchIcon />
        </View>
      )}

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        onFocus={onFocus}
        onBlur={onBlur}
        autoFocus={autoFocus}
        editable={editable}
        returnKeyType="search"
        clearButtonMode="never" // We'll use our custom clear button
      />

      {value.length > 0 && onClear && (
        <ClearIcon />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.shadows.button,
  },

  iconContainer: {
    marginRight: theme.spacing.sm,
  },

  icon: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },

  input: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fontFamily.primary,
    color: theme.colors.textPrimary,
    paddingVertical: 0, // Remove default padding
  },

  clearButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },

  clearIcon: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});