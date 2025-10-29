import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '../../theme';
import type { DiningLocation } from '../../types';
import { positionDotsOnMap } from '../../utils/mapProjection';

interface DiningMapProps {
  locations: DiningLocation[];
  totalCities: number;
  totalRestaurants: number;
  onShare?: () => void;
}

export const DiningMap: React.FC<DiningMapProps> = ({
  locations,
  totalCities,
  totalRestaurants,
  onShare,
}) => {
  // Format plural text
  const cityText = totalCities === 1 ? 'city' : 'cities';
  const restaurantText = totalRestaurants === 1 ? 'restaurant' : 'restaurants';

  // Position dots on map using projection
  const positionedLocations = positionDotsOnMap(locations);

  return (
    <View style={[styles.container, shadows.card]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Dining Map</Text>
          <Text style={styles.subtitle}>
            {totalCities} {cityText} • {totalRestaurants} {restaurantText}
          </Text>
        </View>
        {onShare && (
          <TouchableOpacity onPress={onShare} style={styles.shareButton}>
            <Ionicons name="share-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Map with Dots */}
      <View style={styles.mapContainer}>
        {/* World Map Background */}
        <Image
          source={require('../../../assets/images/World_Map_Grayscale.png')}
          style={styles.mapImage}
          resizeMode="contain"
        />

        {/* City Dots Overlay */}
        {positionedLocations.map((location, index) => (
          <View
            key={`${location.city}-${index}`}
            style={[
              styles.dot,
              {
                left: `${location.x}%`,
                top: `${location.y}%`,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  shareButton: {
    padding: spacing.xs,
  },
  mapContainer: {
    height: 200,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.white,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.white,
    // Adjust for dot center positioning
    marginLeft: -5,
    marginTop: -5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});
