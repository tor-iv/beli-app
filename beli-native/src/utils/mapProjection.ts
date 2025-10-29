/**
 * Map Projection Utilities
 *
 * Converts geographic coordinates (latitude/longitude) to pixel positions
 * on a static world map image using Web Mercator projection.
 */

/**
 * Converts latitude and longitude to x/y percentage positions on a world map
 *
 * @param lat - Latitude in degrees (-90 to 90)
 * @param lng - Longitude in degrees (-180 to 180)
 * @returns Object with x and y as percentage values (0-100)
 */
export function latLngToPixelPercent(lat: number, lng: number): { x: number; y: number } {
  // Clamp latitude to valid range (avoid infinity in Mercator projection)
  const clampedLat = Math.max(-85, Math.min(85, lat));

  // Convert longitude to x position (simple linear mapping)
  // Longitude -180 to 180 maps to 0% to 100%
  const x = ((lng + 180) / 360) * 100;

  // Convert latitude to y position using Web Mercator projection
  // This accounts for the distortion in standard world maps
  const latRad = (clampedLat * Math.PI) / 180;
  const mercatorY = Math.log(Math.tan(Math.PI / 4 + latRad / 2));

  // Normalize to 0-100% (invert y because map coordinates start from top)
  // The constant 3.14159 approximates the range of Mercator projection
  const y = (1 - (mercatorY / Math.PI)) * 50;

  // Clamp to valid percentage range
  return {
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y)),
  };
}

/**
 * Converts an array of dining locations to positioned dots
 *
 * @param locations - Array of dining locations with lat/lng coordinates
 * @returns Array of locations with calculated x/y percentage positions
 */
export function positionDotsOnMap(
  locations: Array<{ lat: number; lng: number; city: string; restaurantIds: string[] }>
): Array<{ x: number; y: number; city: string; restaurantIds: string[] }> {
  return locations.map(location => {
    const position = latLngToPixelPercent(location.lat, location.lng);
    return {
      ...location,
      x: position.x,
      y: position.y,
    };
  });
}
