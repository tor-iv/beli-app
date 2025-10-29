import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '../../theme';
import { MockDataService } from '../../data/mockDataService';
import type { List, UserRestaurantRelation } from '../../types';

interface FeaturedListCardProps {
  list: List;
  onPress: () => void;
}

const CARD_WIDTH = Dimensions.get('window').width * 0.85;
const CARD_HEIGHT = 240;

export function FeaturedListCard({ list, onPress }: FeaturedListCardProps) {
  const [userProgress, setUserProgress] = useState({ been: 0, total: 0 });

  useEffect(() => {
    loadUserProgress();
  }, [list.id]);

  const loadUserProgress = async () => {
    try {
      const currentUser = await MockDataService.getCurrentUser();
      const userRelations = await MockDataService.getUserRestaurantRelations(currentUser.id);

      // Count how many restaurants from this list the user has been to
      const beenCount = list.restaurants.filter(restaurantId =>
        userRelations.some(
          (rel: UserRestaurantRelation) => rel.restaurantId === restaurantId && rel.status === 'been'
        )
      ).length;

      setUserProgress({
        been: beenCount,
        total: list.restaurants.length,
      });
    } catch (error) {
      console.error('Failed to load user progress:', error);
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <ImageBackground
        source={{ uri: list.thumbnailImage || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=500&fit=crop' }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Text style={styles.title}>{list.name}</Text>
            <Text style={styles.subtitle}>
              You've been to {userProgress.been} of {userProgress.total}
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  image: {
    borderRadius: 16,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 15,
    color: colors.white,
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
