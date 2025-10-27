import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, typography } from '../theme';
import { FeaturedListRow } from '../components/lists/FeaturedListRow';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';
import { MockDataService } from '../data/mockDataService';
import type { List } from '../types';
import type { AppStackParamList } from '../navigation/types';

type NavigationProp = StackNavigationProp<AppStackParamList, 'FeaturedLists'>;

interface ListWithProgress extends List {
  progressText: string;
}

export default function FeaturedListsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [lists, setLists] = useState<ListWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLists = async () => {
    try {
      const featuredLists = await MockDataService.getFeaturedLists();
      const currentUser = await MockDataService.getCurrentUser();

      // Get progress for each list
      const listsWithProgress = await Promise.all(
        featuredLists.map(async (list) => {
          const progress = await MockDataService.getUserListProgress(currentUser.id, list.id);
          return {
            ...list,
            progressText: `You've been to ${progress.visited} of ${progress.total}`,
          };
        })
      );

      setLists(listsWithProgress);
    } catch (error) {
      console.error('Failed to load featured lists:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadLists();
  };

  const handleListPress = (listId: string) => {
    // Navigate to list detail screen (to be implemented)
    Alert.alert('Coming Soon', 'List detail view will be added soon.');
  };

  const handleSearchPress = () => {
    Alert.alert('Coming Soon', 'Search functionality will be added soon.');
  };

  const renderListItem = ({ item, index }: { item: ListWithProgress; index: number }) => (
    <FeaturedListRow
      title={item.name}
      description={item.description}
      thumbnailImage={item.thumbnailImage || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop'}
      progressText={item.progressText}
      onPress={() => handleListPress(item.id)}
      isLast={index === lists.length - 1}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="list-outline" size={64} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>No Featured Lists</Text>
      <Text style={styles.emptySubtitle}>Check back later for curated restaurant lists</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>New York, NY</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Pressable style={styles.locationButton}>
          <Text style={styles.headerTitle}>New York, NY</Text>
          <Ionicons name="chevron-down" size={16} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Pressable style={styles.searchBar} onPress={handleSearchPress}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search</Text>
        </Pressable>
      </View>

      {/* Lists */}
      <FlatList
        data={lists}
        renderItem={renderListItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={lists.length === 0 ? styles.emptyListContent : undefined}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: spacing.xs,
  },
  headerRight: {
    width: 40, // Balance the back button width
  },
  searchContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchBar: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl * 3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyListContent: {
    flexGrow: 1,
  },
});
