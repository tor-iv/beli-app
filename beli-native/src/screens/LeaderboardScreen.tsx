import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { colors, typography, spacing } from '../theme';
import { UserStats, LoadingSpinner, Avatar, MatchPercentage, Row, Column } from '../components';
import { MockDataService } from '../data/mockDataService';
import type { User } from '../data/mock/types';

interface LeaderboardUser extends User {
  rank: number;
  matchPercentage: number;
}

export default function LeaderboardScreen() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const [allUsers, current] = await Promise.all([
        MockDataService.getLeaderboard(),
        MockDataService.getCurrentUser()
      ]);

      setCurrentUser(current);

      const leaderboardUsers = allUsers
        .map((user, index) => ({
          ...user,
          rank: index + 1,
          matchPercentage: Math.floor(Math.random() * 40) + 60,
        }))
        .sort((a, b) => b.stats.totalReviews - a.stats.totalReviews);

      setUsers(leaderboardUsers);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderUserItem = ({ item }: { item: LeaderboardUser }) => {
    const isCurrentUser = currentUser?.id === item.id;

    return (
      <View style={[styles.userItem, isCurrentUser && styles.currentUserItem]}>
        <Row align="center" gap={spacing.md}>
          <Text style={styles.rank}>#{item.rank}</Text>

          <Avatar
            imageUrl={item.avatar}
            name={item.displayName}
            size="md"
          />

          <Column style={styles.userInfo}>
            <Text style={styles.userName}>
              {item.displayName} {isCurrentUser && '(You)'}
            </Text>
            <Text style={styles.userLocation}>{item.location.city}, {item.location.state}</Text>
          </Column>

          <Column align="flex-end" gap={spacing.xs}>
            <MatchPercentage percentage={item.matchPercentage} size="sm" />
            <Text style={styles.reviewCount}>
              {item.stats.totalReviews} reviews
            </Text>
          </Column>
        </Row>
      </View>
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top reviewers in your area</Text>
      </View>

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
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
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  userItem: {
    backgroundColor: colors.cardWhite,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    padding: spacing.md,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  currentUserItem: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  rank: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    width: 40,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  userLocation: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  reviewCount: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'right',
  },
});
