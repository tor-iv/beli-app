import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { RatingBubble } from '../rating/RatingBubble';
import type { CuisineBreakdown, CityBreakdown, CountryBreakdown } from '../../types';

export type SortOption = 'count' | 'avgScore';

interface TasteProfileListProps {
  data: Array<CuisineBreakdown | CityBreakdown | CountryBreakdown>;
  totalCount: number;
  sortBy: SortOption;
  onSortPress: () => void;
  onItemPress: (item: CuisineBreakdown | CityBreakdown | CountryBreakdown) => void;
}

export const TasteProfileList: React.FC<TasteProfileListProps> = ({
  data,
  totalCount,
  sortBy,
  onSortPress,
  onItemPress,
}) => {
  const getSortLabel = () => {
    return sortBy === 'count' ? 'Sort: Count' : 'Sort: Avg. Score';
  };

  const getItemName = (item: CuisineBreakdown | CityBreakdown | CountryBreakdown) => {
    if ('cuisine' in item) return item.cuisine;
    if ('city' in item) return item.city;
    return item.country;
  };

  const renderItem = ({ item }: { item: CuisineBreakdown | CityBreakdown | CountryBreakdown }) => {
    const name = getItemName(item);

    return (
      <TouchableOpacity style={styles.listItem} onPress={() => onItemPress(item)}>
        <View style={styles.listItemLeft}>
          <Text style={styles.itemName}>{name}</Text>
          <Text style={styles.itemCount}>{item.count} places</Text>
        </View>

        <View style={styles.listItemRight}>
          <RatingBubble rating={item.avgScore} size="small" />
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {totalCount} {totalCount === 1 ? 'Item' : 'Items'}
        </Text>
        <TouchableOpacity onPress={onSortPress} style={styles.sortButton}>
          <Ionicons name="swap-vertical" size={16} color={colors.textSecondary} />
          <Text style={styles.sortText}>{getSortLabel()}</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${getItemName(item)}-${index}`}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sortText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
  },
  listItemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  itemCount: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.lg,
  },
});
