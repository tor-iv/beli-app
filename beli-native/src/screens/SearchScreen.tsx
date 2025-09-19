import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { colors, typography, spacing } from '../theme';
import { SearchBar, RestaurantCard, LoadingSpinner, EmptyState } from '../components';
import { MockDataService } from '../data/mockDataService';
import type { Restaurant } from '../data/mock/types';

export default function SearchScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    filterRestaurants(searchQuery);
  }, [searchQuery, restaurants]);

  const loadRestaurants = async () => {
    try {
      const restaurantData = await MockDataService.getAllRestaurants();
      setRestaurants(restaurantData);
      setFilteredRestaurants(restaurantData);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRestaurants = (query: string) => {
    if (!query.trim()) {
      setFilteredRestaurants(restaurants);
      return;
    }

    const filtered = restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.cuisine.some(c => c.toLowerCase().includes(query.toLowerCase())) ||
      restaurant.location.neighborhood.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredRestaurants(filtered);
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <RestaurantCard restaurant={item} style={styles.restaurantCard} />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search restaurants, cuisine, neighborhood..."
          />
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search restaurants, cuisine, neighborhood..."
        />
      </View>

      {filteredRestaurants.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No restaurants found" : "Start searching"}
          description={searchQuery ? `No results for "${searchQuery}"` : "Search for restaurants by name, cuisine, or neighborhood"}
          iconName="search-outline"
        />
      ) : (
        <FlatList
          data={filteredRestaurants}
          renderItem={renderRestaurant}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.cardWhite,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  row: {
    justifyContent: 'space-between',
  },
  restaurantCard: {
    width: '48%',
    marginBottom: spacing.md,
  },
});
