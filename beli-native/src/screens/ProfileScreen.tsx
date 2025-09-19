import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../theme';
import {
  Avatar,
  UserStats,
  LoadingSpinner,
  Row,
  Column,
  Spacer,
  Card,
  RestaurantListItem,
  StreakBadge
} from '../components';
import { MockDataService } from '../data/mockDataService';
import type { User, Restaurant, Review } from '../data/mock/types';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [recentRestaurants, setRecentRestaurants] = useState<Restaurant[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const currentUser = await MockDataService.getCurrentUser();
      const [restaurants, reviews] = await Promise.all([
        MockDataService.getAllRestaurants(),
        MockDataService.getUserReviews(currentUser.id)
      ]);

      setUser(currentUser);

      setRecentReviews(reviews.slice(0, 3));

      const recentRestaurantIds = reviews.slice(0, 5).map(review => review.restaurantId);
      const recent = restaurants.filter(restaurant =>
        recentRestaurantIds.includes(restaurant.id)
      );
      setRecentRestaurants(recent);

    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Row align="center" gap={spacing.lg}>
            <Avatar
              imageUrl={user.avatar}
              name={user.displayName}
              size="xl"
            />

            <Column style={styles.userInfo}>
              <Text style={styles.userName}>{user.displayName}</Text>
              <Text style={styles.userLocation}>{user.location.city}, {user.location.state}</Text>
              <Spacer size="xs" />
              <Row align="center" gap={spacing.sm}>
                <StreakBadge count={user.stats.currentStreak} />
                <Text style={styles.streakText}>day streak</Text>
              </Row>
            </Column>
          </Row>
        </View>

        <Card style={styles.statsCard}>
          <UserStats user={user} />
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          {recentReviews.map((review) => {
            const restaurant = recentRestaurants.find(r => r.id === review.restaurantId);
            return restaurant ? (
              <RestaurantListItem
                key={review.id}
                restaurant={restaurant}
                style={styles.restaurantItem}
              />
            ) : null;
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Visited</Text>
          {recentRestaurants.slice(0, 3).map((restaurant) => (
            <RestaurantListItem
              key={restaurant.id}
              restaurant={restaurant}
              style={styles.restaurantItem}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.sizes.base,
    color: colors.error,
  },
  header: {
    backgroundColor: colors.cardWhite,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  userLocation: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  streakText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  statsCard: {
    margin: spacing.lg,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  restaurantItem: {
    marginBottom: spacing.sm,
  },
});
