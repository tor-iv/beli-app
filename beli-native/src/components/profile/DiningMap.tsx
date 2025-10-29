import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '../../theme';
import type { DiningLocation } from '../../types';

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

  // Calculate initial region to show all markers
  const getInitialRegion = () => {
    if (locations.length === 0) {
      return {
        latitude: 40.7128,
        longitude: -74.0060,
        latitudeDelta: 50,
        longitudeDelta: 50,
      };
    }

    // Calculate bounds
    const lats = locations.map(loc => loc.lat);
    const lngs = locations.map(loc => loc.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = (maxLat - minLat) * 1.5 || 50; // Add padding
    const lngDelta = (maxLng - minLng) * 1.5 || 50;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  };

  return (
    <View style={[styles.container, shadows.medium]}>
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

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={getInitialRegion()}
          provider={PROVIDER_GOOGLE}
          mapType="standard"
          scrollEnabled={true}
          zoomEnabled={true}
          pitchEnabled={false}
          rotateEnabled={false}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {locations.map((location, index) => {
            const markerRestaurantText = location.restaurantIds.length === 1 ? 'restaurant' : 'restaurants';
            return (
              <Marker
                key={`${location.city}-${index}`}
                coordinate={{
                  latitude: location.lat,
                  longitude: location.lng,
                }}
                title={location.city}
                description={`${location.restaurantIds.length} ${markerRestaurantText}`}
                pinColor={colors.primary}
              />
            );
          })}
        </MapView>
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
    backgroundColor: '#E5E5E5',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
