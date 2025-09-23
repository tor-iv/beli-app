import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface DropdownFilter {
  id: string;
  label: string;
  options: FilterOption[];
  selectedOption?: string;
  displayLabel?: string;
  isActive?: boolean;
}

type FilterItemType = 'filter' | 'dropdown';

interface OrderedFilterItem {
  type: FilterItemType;
  id: string;
}

interface FilterPillsProps {
  filters: FilterOption[];
  selectedFilters: string[];
  onFilterPress: (filterId: string) => void;
  dropdownFilters?: DropdownFilter[];
  onDropdownSelect?: (filterId: string, optionId: string) => void;
  onDropdownPress?: (filterId: string) => boolean;
  showIcon?: boolean;
  scrollable?: boolean;
  style?: ViewStyle;
  testID?: string;
  orderedItems?: OrderedFilterItem[];
}

export const FilterPills: React.FC<FilterPillsProps> = ({
  filters,
  selectedFilters,
  onFilterPress,
  dropdownFilters = [],
  onDropdownSelect,
  onDropdownPress,
  showIcon = false,
  scrollable = true,
  style,
  testID,
  orderedItems,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const renderFilter = (filter: FilterOption) => {
    const isSelected = selectedFilters.includes(filter.id);
    const label = filter.count !== undefined
      ? `${filter.label} (${filter.count})`
      : filter.label;

    return (
      <Pressable
        key={filter.id}
        style={[
          styles.filterPill,
          isSelected && styles.filterPillSelected,
        ]}
        onPress={() => onFilterPress(filter.id)}
      >
        <Text style={[
          styles.filterText,
          isSelected && styles.filterTextSelected,
        ]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  const renderDropdownFilter = (dropdownFilter: DropdownFilter) => {
    const isOpen = openDropdown === dropdownFilter.id;
    const selectedOption = dropdownFilter.options.find(opt => opt.id === dropdownFilter.selectedOption);
    const isActive = dropdownFilter.isActive || !!dropdownFilter.selectedOption;
    const displayLabel = dropdownFilter.displayLabel
      ? dropdownFilter.displayLabel
      : selectedOption
        ? selectedOption.label
        : dropdownFilter.label;

    return (
      <View key={dropdownFilter.id} style={styles.dropdownContainer}>
        <Pressable
          style={[
            styles.filterPill,
            styles.dropdownPill,
            isActive && styles.filterPillSelected,
          ]}
          onPress={() => {
            if (onDropdownPress?.(dropdownFilter.id)) {
              setOpenDropdown(null);
              return;
            }
            setOpenDropdown(isOpen ? null : dropdownFilter.id);
          }}
        >
          <Text style={[
            styles.filterText,
            isActive && styles.filterTextSelected,
          ]}>
            {displayLabel}
          </Text>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={isActive ? theme.colors.primary : theme.colors.textSecondary}
            style={styles.dropdownIcon}
          />
        </Pressable>

        {isOpen && (
          <View style={styles.dropdownMenu}>
            {dropdownFilter.options.map((option) => (
              <Pressable
                key={option.id}
                style={[
                  styles.dropdownOption,
                  option.id === dropdownFilter.selectedOption && styles.selectedDropdownOption,
                ]}
                onPress={() => {
                  onDropdownSelect?.(dropdownFilter.id, option.id);
                  setOpenDropdown(null);
                }}
              >
                <Text style={[
                  styles.dropdownOptionText,
                  option.id === dropdownFilter.selectedOption && styles.selectedDropdownOptionText,
                ]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderItems = () => {
    if (orderedItems?.length) {
      return orderedItems.map((item) => {
        if (item.type === 'dropdown') {
          const dropdown = dropdownFilters.find(df => df.id === item.id);
          if (!dropdown) return null;
          return renderDropdownFilter(dropdown);
        }

        const filter = filters.find(f => f.id === item.id);
        if (!filter) return null;
        return renderFilter(filter);
      }).filter(Boolean);
    }

    return [
      ...dropdownFilters.map(renderDropdownFilter),
      ...filters.map(renderFilter),
    ];
  };

  const content = (
    <View style={[styles.container, style]} testID={testID}>
      {showIcon && (
        <View style={styles.iconContainer}>
          <View style={styles.filterIcon}>
            <Ionicons name="options-outline" size={18} color={theme.colors.textPrimary} />
          </View>
        </View>
      )}

      {scrollable ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderItems()}
        </ScrollView>
      ) : (
        <View style={styles.filtersContainer}>
          {renderItems()}
        </View>
      )}
    </View>
  );

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.edgePadding,
  },

  iconContainer: {
    marginRight: theme.spacing.sm,
  },

  filterIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.spacing.borderRadius.full,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.borderMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContent: {
    paddingRight: theme.spacing.edgePadding,
  },

  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },

  filterPill: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.spacing.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.borderMedium,
    backgroundColor: theme.colors.white,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },

  filterPillSelected: {
    borderColor: theme.colors.primary,
  },

  dropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },

  filterText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.medium,
  },

  filterTextSelected: {
    color: theme.colors.primary,
  },

  dropdownIcon: {
    marginLeft: theme.spacing.xs,
  },

  dropdownContainer: {
    position: 'relative',
    marginRight: theme.spacing.sm,
  },

  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: theme.spacing.xs,
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.borderRadius.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
    minWidth: 120,
  },

  dropdownOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },

  selectedDropdownOption: {
    backgroundColor: theme.colors.primary + '10',
  },

  dropdownOptionText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },

  selectedDropdownOptionText: {
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
  },
});
