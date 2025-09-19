import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { Chip } from '../base';
import { theme } from '../../theme';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterPillsProps {
  filters: FilterOption[];
  selectedFilters: string[];
  onFilterPress: (filterId: string) => void;
  showIcon?: boolean;
  scrollable?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const FilterPills: React.FC<FilterPillsProps> = ({
  filters,
  selectedFilters,
  onFilterPress,
  showIcon = true,
  scrollable = true,
  style,
  testID,
}) => {
  const renderFilter = (filter: FilterOption) => {
    const isSelected = selectedFilters.includes(filter.id);
    const label = filter.count !== undefined
      ? `${filter.label} (${filter.count})`
      : filter.label;

    return (
      <Chip
        key={filter.id}
        label={label}
        selected={isSelected}
        onPress={() => onFilterPress(filter.id)}
        variant="filter"
        size="small"
        style={styles.filterChip}
      />
    );
  };

  const content = (
    <View style={[styles.container, style]} testID={testID}>
      {showIcon && (
        <View style={styles.iconContainer}>
          {/* Filter Icon - in a real app this would be an actual icon */}
          <Chip
            label="⚙️"
            variant="filter"
            size="small"
            style={styles.iconChip}
          />
        </View>
      )}

      {scrollable ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filters.map(renderFilter)}
        </ScrollView>
      ) : (
        <View style={styles.filtersContainer}>
          {filters.map(renderFilter)}
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
  },

  iconContainer: {
    marginRight: theme.spacing.sm,
    paddingLeft: theme.spacing.edgePadding,
  },

  iconChip: {
    width: 32,
    paddingHorizontal: 0,
  },

  scrollContent: {
    paddingRight: theme.spacing.edgePadding,
  },

  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    paddingHorizontal: theme.spacing.edgePadding,
  },

  filterChip: {
    marginRight: theme.spacing.sm,
  },
});