/**
 * Supported cities for location-based search
 * Each city includes coordinates for geo-search
 */

export interface City {
  id: string;
  name: string;
  state: string;
  displayName: string; // "New York, NY"
  coordinates: { lat: number; lng: number };
}

export const CITIES: City[] = [
  // Major US Cities
  {
    id: 'nyc',
    name: 'New York',
    state: 'NY',
    displayName: 'New York, NY',
    coordinates: { lat: 40.7128, lng: -74.006 },
  },
  {
    id: 'brooklyn',
    name: 'Brooklyn',
    state: 'NY',
    displayName: 'Brooklyn, NY',
    coordinates: { lat: 40.6782, lng: -73.9442 },
  },
  {
    id: 'la',
    name: 'Los Angeles',
    state: 'CA',
    displayName: 'Los Angeles, CA',
    coordinates: { lat: 34.0522, lng: -118.2437 },
  },
  {
    id: 'sf',
    name: 'San Francisco',
    state: 'CA',
    displayName: 'San Francisco, CA',
    coordinates: { lat: 37.7749, lng: -122.4194 },
  },
  {
    id: 'chicago',
    name: 'Chicago',
    state: 'IL',
    displayName: 'Chicago, IL',
    coordinates: { lat: 41.8781, lng: -87.6298 },
  },
  {
    id: 'miami',
    name: 'Miami',
    state: 'FL',
    displayName: 'Miami, FL',
    coordinates: { lat: 25.7617, lng: -80.1918 },
  },
  {
    id: 'seattle',
    name: 'Seattle',
    state: 'WA',
    displayName: 'Seattle, WA',
    coordinates: { lat: 47.6062, lng: -122.3321 },
  },
  {
    id: 'austin',
    name: 'Austin',
    state: 'TX',
    displayName: 'Austin, TX',
    coordinates: { lat: 30.2672, lng: -97.7431 },
  },
  {
    id: 'boston',
    name: 'Boston',
    state: 'MA',
    displayName: 'Boston, MA',
    coordinates: { lat: 42.3601, lng: -71.0589 },
  },
  {
    id: 'denver',
    name: 'Denver',
    state: 'CO',
    displayName: 'Denver, CO',
    coordinates: { lat: 39.7392, lng: -104.9903 },
  },
  {
    id: 'portland',
    name: 'Portland',
    state: 'OR',
    displayName: 'Portland, OR',
    coordinates: { lat: 45.5152, lng: -122.6784 },
  },
  {
    id: 'dc',
    name: 'Washington',
    state: 'DC',
    displayName: 'Washington, DC',
    coordinates: { lat: 38.9072, lng: -77.0369 },
  },
  {
    id: 'philly',
    name: 'Philadelphia',
    state: 'PA',
    displayName: 'Philadelphia, PA',
    coordinates: { lat: 39.9526, lng: -75.1652 },
  },
  {
    id: 'atlanta',
    name: 'Atlanta',
    state: 'GA',
    displayName: 'Atlanta, GA',
    coordinates: { lat: 33.749, lng: -84.388 },
  },
  {
    id: 'nashville',
    name: 'Nashville',
    state: 'TN',
    displayName: 'Nashville, TN',
    coordinates: { lat: 36.1627, lng: -86.7816 },
  },
  {
    id: 'newark',
    name: 'Newark',
    state: 'NJ',
    displayName: 'Newark, NJ',
    coordinates: { lat: 40.7357, lng: -74.1724 },
  },
  {
    id: 'neworleans',
    name: 'New Orleans',
    state: 'LA',
    displayName: 'New Orleans, LA',
    coordinates: { lat: 29.9511, lng: -90.0715 },
  },
];

// NYC is the default since most mock data is located there
export const DEFAULT_CITY = CITIES[0];

/**
 * Search cities by name (case-insensitive)
 * Matches from the start of city name or state
 */
export function searchCities(query: string): City[] {
  if (!query.trim()) {
    return CITIES;
  }

  const normalizedQuery = query.toLowerCase().trim();

  return CITIES.filter(
    (city) =>
      city.name.toLowerCase().startsWith(normalizedQuery) ||
      city.displayName.toLowerCase().includes(normalizedQuery) ||
      city.state.toLowerCase() === normalizedQuery
  );
}
