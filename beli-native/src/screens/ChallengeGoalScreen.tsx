import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../theme';
import {
  CircularBadge,
  ChallengeProgressCard,
  ChallengeActivityCard,
  LoadingSpinner,
} from '../components';
import { MockDataService } from '../data/mockDataService';
import type { User, Review, Restaurant } from '../types';

interface GroupedReviews {
  [key: string]: Array<{
    review: Review;
    restaurant: Restaurant;
  }>;
}

export default function ChallengeGoalScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [groupedReviews, setGroupedReviews] = useState<GroupedReviews>({});

  useEffect(() => {
    loadChallengeData();
  }, []);

  const loadChallengeData = async () => {
    try {
      const [currentUser, allRestaurants] = await Promise.all([
        MockDataService.getCurrentUser(),
        MockDataService.getAllRestaurants(),
      ]);

      const reviews = await MockDataService.getUserReviews(currentUser.id);

      // Group reviews by month
      const grouped: GroupedReviews = {};
      reviews.forEach((review) => {
        const restaurant = allRestaurants.find((r) => r.id === review.restaurantId);
        if (restaurant) {
          const date = new Date(review.createdAt);
          const monthYear = date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          }).toUpperCase();

          if (!grouped[monthYear]) {
            grouped[monthYear] = [];
          }
          grouped[monthYear].push({ review, restaurant });
        }
      });

      setUser(currentUser);
      setGroupedReviews(grouped);
    } catch (error) {
      console.error('Failed to load challenge data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysLeft = () => {
    if (!user?.stats.challenge2025) return 0;
    const endDate = new Date(user.stats.challenge2025.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
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

  if (!user || !user.stats.challenge2025) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No challenge data found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const challenge = user.stats.challenge2025;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={32} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>beli</Text>
        <TouchableOpacity hitSlop={8}>
          <Ionicons name="ellipsis-horizontal" size={32} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{challenge.year} Restaurant Challenge</Text>
        </View>

        {/* Circular Badge */}
        <View style={styles.badgeContainer}>
          <CircularBadge year={challenge.year} size={160} />
        </View>

        {/* Progress Card */}
        <ChallengeProgressCard
          current={challenge.currentCount}
          goal={challenge.goalCount}
          daysLeft={calculateDaysLeft()}
        />

        {/* Monthly Timeline */}
        <View style={styles.timelineContainer}>
          {Object.entries(groupedReviews).map(([monthYear, items]) => (
            <View key={monthYear} style={styles.monthSection}>
              <View style={styles.monthHeader}>
                <Text style={styles.monthTitle}>{monthYear}</Text>
              </View>
              {items.map(({ review, restaurant }, index) => (
                <View key={review.id}>
                  <ChallengeActivityCard
                    userAvatar={user.avatar}
                    restaurantName={restaurant.name}
                    cuisine={restaurant.cuisine[0]}
                    location={`${restaurant.location.neighborhood}, ${restaurant.location.city}`}
                    rating={review.rating}
                    notes={review.content}
                    date={formatDate(review.createdAt)}
                    onPress={() => {
                      // Navigate to restaurant detail
                    }}
                  />
                  {index < items.length - 1 && <View style={styles.cardSeparator} />}
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: spacing.xl }} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  titleSection: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: 110,
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: typography.weights.bold,
    color: colors.white,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  badgeContainer: {
    alignItems: 'center',
    marginTop: -80, // Pull up to center badge on teal/white border
    marginBottom: spacing.lg,
    zIndex: 10,
  },
  timelineContainer: {
    marginTop: spacing.xl,
  },
  monthSection: {
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  monthHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  monthTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  cardSeparator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.lg,
  },
});
