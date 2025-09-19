import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView } from 'react-native';
import { Chip } from '../base';
import { Text } from '../typography';
import { theme } from '../../theme';

interface PopularDishesProps {
  dishes: string[];
  title?: string;
  onDishPress?: (dish: string) => void;
  maxVisible?: number;
  scrollable?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const PopularDishes: React.FC<PopularDishesProps> = ({
  dishes,
  title = 'Popular Dishes',
  onDishPress,
  maxVisible,
  scrollable = false,
  style,
  testID,
}) => {
  const displayDishes = maxVisible ? dishes.slice(0, maxVisible) : dishes;

  const dishChips = displayDishes.map((dish) => (
    <Chip
      key={dish}
      label={dish}
      onPress={onDishPress ? () => onDishPress(dish) : undefined}
      variant="outlined"
      size="small"
      style={styles.chip}
    />
  ));

  return (
    <View style={[styles.container, style]} testID={testID}>
      {title && (
        <Text variant="h4" style={styles.title}>
          {title}
        </Text>
      )}

      {scrollable ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {dishChips}
        </ScrollView>
      ) : (
        <View style={styles.chipsContainer}>
          {dishChips}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Base container styles
  },

  title: {
    marginBottom: theme.spacing.sm,
  },

  scrollContent: {
    paddingHorizontal: theme.spacing.edgePadding,
  },

  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  chip: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
});