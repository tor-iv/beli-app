import React, { useState, useMemo } from 'react';
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
import { useQueries } from '@tanstack/react-query';
import { colors, spacing, typography } from '../theme';
import { CategoryPills, FeaturedListRow, LoadingSpinner, TastemakerPostCard } from '../components';
import {
  useFeaturedLists,
  useCurrentUser,
  useTastemakerPosts,
} from '../lib/hooks';
import { ListService } from '../lib/services/lists/ListService';
import type { List, TastemakerPost } from '../types';
import type { AppStackParamList } from '../navigation/types';

type NavigationProp = StackNavigationProp<AppStackParamList, 'Tastemakers'>;
type ViewMode = 'lists' | 'articles';

interface ListWithProgress extends List {
  progressText: string;
}

export default function TastemakersScreen() {
  const navigation = useNavigation<NavigationProp>();

  // UI state
  const [mode, setMode] = useState<ViewMode>('lists');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Data fetching with React Query hooks
  const { data: currentUser } = useCurrentUser();
  const {
    data: rawFeaturedLists = [],
    isLoading: listsLoading,
    refetch: refetchLists,
    isRefetching: listsRefetching,
  } = useFeaturedLists();
  const {
    data: tastemakerPosts = [],
    isLoading: postsLoading,
    refetch: refetchPosts,
    isRefetching: postsRefetching,
  } = useTastemakerPosts();

  // Fetch progress for each list using useQueries
  const progressQueries = useQueries({
    queries: rawFeaturedLists.map((list) => ({
      queryKey: ['lists', 'progress', currentUser?.id, list.id],
      queryFn: () => ListService.getUserListProgress(currentUser!.id, list.id),
      enabled: !!currentUser && !!list.id,
      staleTime: 5 * 60 * 1000,
    })),
  });

  // Combine lists with progress data
  const featuredLists = useMemo((): ListWithProgress[] => {
    return rawFeaturedLists.map((list, index) => {
      const progressData = progressQueries[index]?.data;
      const progressText = progressData
        ? `You've been to ${progressData.visited} of ${progressData.total}`
        : 'Loading...';
      return { ...list, progressText };
    });
  }, [rawFeaturedLists, progressQueries]);

  const isLoading = listsLoading || postsLoading;
  const isRefetching = listsRefetching || postsRefetching;

  const handleRefresh = () => {
    refetchLists();
    refetchPosts();
  };

  const handleListPress = (listId: string) => {
    navigation.navigate('FeaturedListDetail', { listId });
  };

  const handlePostPress = (postId: string) => {
    navigation.navigate('TastemakerPost', { postId });
  };

  const handleSearchPress = () => {
    Alert.alert('Coming Soon', 'Search functionality will be added soon.');
  };

  // Filter posts by category - exact tag matching
  const filteredPosts = selectedCategory === 'All'
    ? tastemakerPosts
    : tastemakerPosts.filter(post =>
        post.tags.includes(selectedCategory)
      );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Tastemakers</Text>
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
          <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Tastemakers</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Pressable style={styles.searchBar} onPress={handleSearchPress}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search</Text>
        </Pressable>
      </View>

      {/* Toggle */}
      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.toggleButton, styles.toggleButtonLeft, mode === 'lists' && styles.toggleButtonActive]}
          onPress={() => setMode('lists')}
        >
          <Text style={[styles.toggleText, mode === 'lists' && styles.toggleTextActive]}>
            Featured Lists
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, styles.toggleButtonRight, mode === 'articles' && styles.toggleButtonActive]}
          onPress={() => setMode('articles')}
        >
          <Text style={[styles.toggleText, mode === 'articles' && styles.toggleTextActive]}>
            Tastemaker Articles
          </Text>
        </Pressable>
      </View>

      {mode === 'lists' ? (
        // Featured Lists Mode
        <FlatList
          data={featuredLists}
          renderItem={({ item, index }) => (
            <FeaturedListRow
              title={item.name}
              description={item.description}
              thumbnailImage={item.thumbnailImage || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop'}
              progressText={item.progressText}
              onPress={() => handleListPress(item.id)}
              isLast={index === featuredLists.length - 1}
            />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={styles.listsContent}
        />
      ) : (
        // Tastemaker Articles Mode
        <View style={styles.articlesContainer}>
          <View style={styles.categoryPillsContainer}>
            <CategoryPills
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          </View>
          <FlatList
            data={filteredPosts}
            renderItem={({ item }) => (
              <TastemakerPostCard
                post={item}
                variant="compact"
                onPress={() => handlePostPress(item.id)}
              />
            )}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
            contentContainerStyle={styles.articlesContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
          />
        </View>
      )}
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
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  toggleButtonLeft: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  toggleButtonRight: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listsContent: {
    backgroundColor: colors.white,
  },
  articlesContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  categoryPillsContainer: {
    backgroundColor: colors.white,
    paddingTop: spacing.sm,
  },
  articlesContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
});
