import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ImageBackground,
  Pressable,
  RefreshControl,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { colors, spacing } from '../theme';
import { RestaurantCard, LoadingSpinner } from '../components';
import { MockDataService } from '../data/mockDataService';
import type { List, Restaurant, UserRestaurantRelation } from '../types';
import type { AppStackParamList } from '../navigation/types';

type FeaturedListDetailScreenNavigationProp = StackNavigationProp<AppStackParamList, 'FeaturedListDetail'>;
type FeaturedListDetailScreenRouteProp = RouteProp<AppStackParamList, 'FeaturedListDetail'>;

const HERO_HEIGHT = Dimensions.get('window').height * 0.4;

export default function FeaturedListDetailScreen() {
  const navigation = useNavigation<FeaturedListDetailScreenNavigationProp>();
  const route = useRoute<FeaturedListDetailScreenRouteProp>();
  const { listId } = route.params;

  const [list, setList] = useState<List | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [userProgress, setUserProgress] = useState({ been: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    loadListDetails();
  }, [listId]);

  const loadListDetails = async () => {
    try {
      const listData = await MockDataService.getListById(listId);
      if (!listData) {
        navigation.goBack();
        return;
      }

      setList(listData);

      // Load restaurants in the list
      const restaurantData = await Promise.all(
        listData.restaurants.map((id) => MockDataService.getRestaurantById(id))
      );
      const validRestaurants = restaurantData.filter((r): r is Restaurant => r !== null);
      setRestaurants(validRestaurants);

      // Load user progress
      const currentUser = await MockDataService.getCurrentUser();
      const userRelations = await MockDataService.getUserRestaurantRelations(currentUser.id);

      const beenCount = listData.restaurants.filter(restaurantId =>
        userRelations.some(
          (rel: UserRestaurantRelation) => rel.restaurantId === restaurantId && rel.status === 'been'
        )
      ).length;

      setUserProgress({
        been: beenCount,
        total: listData.restaurants.length,
      });
    } catch (error) {
      console.error('Failed to load list details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadListDetails();
  };

  const handleRestaurantPress = (restaurantId: string) => {
    navigation.navigate('RestaurantInfo', { restaurantId });
  };

  const renderHeader = () => {
    if (!list) return null;

    return (
      <View>
        {/* Hero Image Section */}
        <ImageBackground
          source={{
            uri: list.thumbnailImage || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=500&fit=crop',
          }}
          style={styles.heroImage}
          imageStyle={styles.heroImageStyle}
        >
          {/* Back and Share Buttons */}
          <SafeAreaView style={styles.heroHeader}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.headerButton}
            >
              <Ionicons name="chevron-back" size={28} color={colors.white} />
            </Pressable>
            <Pressable style={styles.headerButton}>
              <Ionicons name="share-outline" size={24} color={colors.white} />
            </Pressable>
          </SafeAreaView>

          {/* List/Map Toggle */}
          <View style={styles.toggleContainer}>
            <View style={styles.toggle}>
              <Pressable
                style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
                onPress={() => setViewMode('list')}
              >
                <Ionicons
                  name="list"
                  size={20}
                  color={viewMode === 'list' ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.toggleText,
                    viewMode === 'list' && styles.toggleTextActive,
                  ]}
                >
                  List
                </Text>
              </Pressable>
              <Pressable
                style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
                onPress={() => setViewMode('map')}
              >
                <Ionicons
                  name="location"
                  size={20}
                  color={viewMode === 'map' ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.toggleText,
                    viewMode === 'map' && styles.toggleTextActive,
                  ]}
                >
                  Map
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
            style={styles.gradient}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{list.name}</Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Pressable style={styles.actionButton}>
            <Ionicons name="bookmark-outline" size={22} color={colors.textPrimary} />
            <Text style={styles.actionButtonText}>Bookmark all</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Ionicons name="share-outline" size={22} color={colors.textPrimary} />
            <Text style={styles.actionButtonText}>Share</Text>
          </Pressable>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{list.description}</Text>
          <Text style={styles.progressText}>
            You've been to {userProgress.been} of {userProgress.total}
          </Text>
        </View>
      </View>
    );
  };

  const renderRestaurant = ({ item, index }: { item: Restaurant; index: number }) => (
    <View style={styles.restaurantItem}>
      <View style={styles.restaurantNumber}>
        <Text style={styles.restaurantNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.restaurantCardWrapper}>
        <RestaurantCard
          restaurant={item}
          onPress={() => handleRestaurantPress(item.id)}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!list) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>List not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={restaurants}
        renderItem={renderRestaurant}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />
    </View>
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
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  heroImage: {
    height: HERO_HEIGHT,
    justifyContent: 'space-between',
  },
  heroImageStyle: {
    resizeMode: 'cover',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleContainer: {
    alignItems: 'center',
    paddingBottom: spacing.md,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  toggleButtonActive: {
    backgroundColor: colors.cardWhite,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.primary,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT * 0.6,
    justifyContent: 'flex-end',
  },
  heroContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  descriptionContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  progressText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  restaurantItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  restaurantNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: spacing.sm,
  },
  restaurantNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  restaurantCardWrapper: {
    flex: 1,
  },
});
