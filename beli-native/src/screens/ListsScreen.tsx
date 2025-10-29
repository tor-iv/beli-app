import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Dimensions, Modal, TextInput, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';
import { colors, typography, spacing } from '../theme';
import {
  RestaurantListItem,
  LoadingSpinner,
  TabSelector,
  FilterPills,
  CategoryDropdown,
  SortToggle,
  ViewMapButton
} from '../components';
import { MockDataService } from '../data/mockDataService';
import type { Restaurant, ListCategory } from '../types';
import type { BottomTabParamList, AppStackParamList } from '../navigation/types';

type ListsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Lists'>,
  StackNavigationProp<AppStackParamList>
>;

type ListsScreenRouteProp = RouteProp<BottomTabParamList, 'Lists'>;

type CityOptionItem = {
  id: string;
  label: string;
  city?: string;
  state?: string;
  country?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
};

type CuisineOptionItem = {
  id: string;
  label: string;
};

const CITY_OPTIONS: CityOptionItem[] = [
  { id: 'current_location', label: 'Current Location', icon: 'navigate-outline', accentColor: colors.primary },
  { id: 'new_york_ny', label: 'New York, NY', city: 'New York', state: 'NY', icon: 'home-outline', accentColor: colors.primary },
  { id: 'los_angeles_ca', label: 'Los Angeles, CA', city: 'Los Angeles', state: 'CA' },
  { id: 'chicago_il', label: 'Chicago, IL', city: 'Chicago', state: 'IL' },
  { id: 'san_francisco_ca', label: 'San Francisco, CA', city: 'San Francisco', state: 'CA' },
  { id: 'abu_dhabi', label: 'Abu Dhabi', city: 'Abu Dhabi' },
  { id: 'agoura_hills_ca', label: 'Agoura Hills, CA', city: 'Agoura Hills', state: 'CA' },
  { id: 'aguadilla_pr', label: 'Aguadilla, PR', city: 'Aguadilla', state: 'PR' },
  { id: 'aguas_calientes', label: 'Aguas Calientes', city: 'Aguas Calientes' },
  { id: 'ahmedabad', label: 'Ahmedabad', city: 'Ahmedabad' },
  { id: 'alexandria_va', label: 'Alexandria, VA', city: 'Alexandria', state: 'VA' },
  { id: 'almada', label: 'Almada', city: 'Almada' },
  { id: 'lima_pe', label: 'Lima, Peru', city: 'Lima' },
  { id: 'copenhagen', label: 'Copenhagen, Denmark', city: 'Copenhagen' },
];

const CITY_LOOKUP: Record<string, CityOptionItem> = CITY_OPTIONS.reduce((acc, option) => {
  acc[option.id] = option;
  return acc;
}, {} as Record<string, CityOptionItem>);

const CITY_FILTER_OPTIONS = CITY_OPTIONS.map(option => ({ id: option.id, label: option.label }));

const CUISINE_OPTIONS: CuisineOptionItem[] = [
  { id: 'acai_bowls', label: 'Acai Bowls' },
  { id: 'afghan', label: 'Afghan' },
  { id: 'african', label: 'African' },
  { id: 'american', label: 'American' },
  { id: 'arabic', label: 'Arabic' },
  { id: 'arepas', label: 'Arepas' },
  { id: 'argentinian', label: 'Argentinian' },
  { id: 'asian', label: 'Asian' },
  { id: 'asian_fusion', label: 'Asian Fusion' },
  { id: 'bakery', label: 'Bakery' },
  { id: 'bbq', label: 'BBQ' },
  { id: 'cafe', label: 'Cafe' },
  { id: 'chinese', label: 'Chinese' },
  { id: 'french', label: 'French' },
  { id: 'greek', label: 'Greek' },
  { id: 'indian', label: 'Indian' },
  { id: 'italian', label: 'Italian' },
  { id: 'japanese', label: 'Japanese' },
  { id: 'korean', label: 'Korean' },
  { id: 'latin', label: 'Latin' },
  { id: 'mediterranean', label: 'Mediterranean' },
  { id: 'mexican', label: 'Mexican' },
  { id: 'middle_eastern', label: 'Middle Eastern' },
  { id: 'pizza', label: 'Pizza' },
  { id: 'seafood', label: 'Seafood' },
  { id: 'spanish', label: 'Spanish' },
  { id: 'steakhouse', label: 'Steakhouse' },
  { id: 'thai', label: 'Thai' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Vegetarian' },
];

const CUISINE_LOOKUP: Record<string, CuisineOptionItem> = CUISINE_OPTIONS.reduce((acc, option) => {
  acc[option.id] = option;
  return acc;
}, {} as Record<string, CuisineOptionItem>);

const CUISINE_FILTER_OPTIONS = CUISINE_OPTIONS.map(option => ({ id: option.id, label: option.label }));

const TAG_OPTIONS: { id: string; label: string }[] = [
  { id: 'chef_driven', label: 'Chef-Driven' },
  { id: 'date_night', label: 'Date Night' },
  { id: 'brunch', label: 'Brunch' },
  { id: 'family_friendly', label: 'Family Friendly' },
  { id: 'late_night', label: 'Late Night' },
  { id: 'vegetarian', label: 'Vegetarian Options' },
  { id: 'vegan', label: 'Vegan Options' },
  { id: 'gluten_free', label: 'Gluten Free' },
  { id: 'wine_program', label: 'Great Wine Program' },
  { id: 'craft_cocktails', label: 'Craft Cocktails' },
  { id: 'outdoor_seating', label: 'Outdoor Seating' },
  { id: 'takeout', label: 'Takeout Friendly' },
];

const TAG_LOOKUP = TAG_OPTIONS.reduce((acc, option) => {
  acc[option.id] = option.label.toLowerCase();
  return acc;
}, {} as Record<string, string>);

const GOOD_FOR_OPTIONS: { id: string; label: string }[] = [
  { id: 'afternoon_tea', label: 'Afternoon Tea' },
  { id: 'after_work', label: 'After Work' },
  { id: 'atmosphere', label: 'Atmosphere' },
  { id: 'ayce', label: 'AYCE' },
  { id: 'beer', label: 'Beer' },
  { id: 'birthdays', label: 'Birthdays' },
  { id: 'bottomless_brunch', label: 'Bottomless Brunch' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'brunch_good_for', label: 'Brunch' },
  { id: 'business_meetings', label: 'Business Meetings' },
  { id: 'celebrations', label: 'Celebrations' },
  { id: 'solo_dining', label: 'Solo Dining' },
  { id: 'special_occasion', label: 'Special Occasion' },
];

const GOOD_FOR_LOOKUP = GOOD_FOR_OPTIONS.reduce((acc, option) => {
  acc[option.id] = option.label.toLowerCase();
  return acc;
}, {} as Record<string, string>);

const PRICE_TIER_OPTIONS: { id: string; label: string }[] = [
  { id: '$', label: '$' },
  { id: '$$', label: '$$' },
  { id: '$$$', label: '$$$' },
  { id: '$$$$', label: '$$$$' },
];

const PRICE_FILTER_OPTIONS: { id: string; label: string }[] = [{ id: 'all', label: 'All Prices' }, ...PRICE_TIER_OPTIONS];
const PRICE_LOOKUP = PRICE_TIER_OPTIONS.reduce((acc, option) => {
  acc[option.id] = option.label;
  return acc;
}, {} as Record<string, string>);

const SCORE_FILTER_OPTIONS: { id: string; label: string }[] = [
  { id: 'all', label: 'Any score' },
  { id: '9', label: '9.0+' },
  { id: '8.5', label: '8.5+' },
  { id: '8', label: '8.0+' },
  { id: '7.5', label: '7.5+' },
];

const FRIEND_FILTER_OPTIONS: { id: string; label: string }[] = [
  { id: 'all', label: 'Any count' },
  { id: '3', label: '3+ friends' },
  { id: '5', label: '5+ friends' },
  { id: '7', label: '7+ friends' },
];

const CATEGORY_ICON_MAP: Record<ListCategory, keyof typeof Ionicons.glyphMap> = {
  restaurants: 'restaurant-outline',
  bars: 'beer-outline',
  bakeries: 'ice-cream-outline',
  coffee_tea: 'cafe-outline',
  dessert: 'ice-cream-outline',
  other: 'grid-outline',
};

const SORT_SEGMENTS: { id: SortType; label: string }[] = [
  { id: 'rating', label: 'Score' },
  { id: 'distance', label: 'Distance' },
  { id: 'friends', label: 'Number of friends' },
];

const summarizeSelectionLabels = (labels: string[], fallbackLabel: string) => {
  if (labels.length === 0) return fallbackLabel;
  if (labels.length === 1) return labels[0];
  return `${labels[0]} +${labels.length - 1}`;
};

const NYC_REGION: Region = {
  latitude: 40.728334,
  longitude: -73.998045,
  latitudeDelta: 0.09,
  longitudeDelta: 0.06,
};

const COORDINATE_OVERRIDES: Record<string, { lat: number; lng: number; neighborhood?: string }> = {
  maido: { lat: 40.7339, lng: -74.0027, neighborhood: 'West Village' },
  'mérito': { lat: 40.7324, lng: -74.001, neighborhood: 'West Village' },
  merito: { lat: 40.7324, lng: -74.001, neighborhood: 'West Village' },
  "l'artusi": { lat: 40.7346, lng: -74.0062, neighborhood: 'West Village' },
  "anton's": { lat: 40.7355, lng: -74.0063, neighborhood: 'West Village' },
  cowgirl: { lat: 40.7339, lng: -74.0068, neighborhood: 'West Village' },
};

const getScoreColor = (score?: number) => {
  if (typeof score !== 'number') return colors.primary;
  if (score >= 7) return colors.ratingExcellent;
  if (score >= 4) return colors.ratingAverage;
  return colors.ratingPoor;
};

type ListType =
  | 'been'
  | 'want'
  | 'recs'
  | 'playlists'
  | 'recs_for_you'
  | 'recs_from_friends'
  | 'trending'
  | 'more';
type SortType = 'rating' | 'distance' | 'name' | 'friends';

export default function ListsScreen() {
  const navigation = useNavigation<ListsScreenNavigationProp>();
  const route = useRoute<ListsScreenRouteProp>();
  const mapButtonOffset = Math.max(spacing.sm, Math.round(Dimensions.get('window').height * 0.01));

  // Safely get initialTab from route params with fallback
  const initialTab = route.params?.initialTab || 'been';

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedTab, setSelectedTab] = useState<ListType>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<ListCategory>('restaurants');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGoodFors, setSelectedGoodFors] = useState<string[]>([]);
  const [selectedPriceTiers, setSelectedPriceTiers] = useState<string[]>([]);
  const [selectedScoreFilter, setSelectedScoreFilter] = useState<string>('all');
  const [selectedFriendFilter, setSelectedFriendFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortType>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isListPickerOpen, setIsListPickerOpen] = useState(false);
  const [isAllFiltersOpen, setIsAllFiltersOpen] = useState(false);
  const [isCityModalVisible, setIsCityModalVisible] = useState(false);
  const [isCuisineModalVisible, setIsCuisineModalVisible] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [cuisineSearch, setCuisineSearch] = useState('');
  const [pendingCitySelection, setPendingCitySelection] = useState<string[]>([]);
  const [pendingCuisineSelection, setPendingCuisineSelection] = useState<string[]>([]);
  const [pendingTagSelection, setPendingTagSelection] = useState<string[]>([]);
  const [pendingGoodForSelection, setPendingGoodForSelection] = useState<string[]>([]);
  const [pendingPriceSelection, setPendingPriceSelection] = useState<string[]>([]);
  const [pendingScoreFilter, setPendingScoreFilter] = useState<string>('all');
  const [pendingFriendFilter, setPendingFriendFilter] = useState<string>('all');
  const [pendingFilterToggles, setPendingFilterToggles] = useState<string[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [tagSearch, setTagSearch] = useState('');
  const [goodForSearch, setGoodForSearch] = useState('');

  // Cache for loaded data by tab
  const [cachedData, setCachedData] = useState<Partial<Record<ListType, Record<string, Restaurant[]>>>>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [listCounts, setListCounts] = useState<Record<string, number>>({});

  // Search functionality
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMapSearchModalVisible, setIsMapSearchModalVisible] = useState(false);
  const [isMoreOptionsVisible, setIsMoreOptionsVisible] = useState(false);

  // Debounce timer ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Map ref for programmatic control
  const mapRef = useRef<MapView>(null);

  const tabs = [
    { id: 'been', label: 'Been' },
    { id: 'want', label: 'Want to Try' },
    { id: 'recs', label: 'Recs' },
    { id: 'playlists', label: 'Playlists' },
    { id: 'more', label: 'More ▾' },
  ];

  const categories: { id: ListCategory; label: string }[] = [
    { id: 'restaurants', label: 'Restaurants' },
    { id: 'bars', label: 'Bars' },
    { id: 'bakeries', label: 'Bakeries' },
    { id: 'coffee_tea', label: 'Coffee & Tea' },
    { id: 'dessert', label: 'Ice Cream & Dessert' },
  ];

  const moreFiltersCount =
    (selectedFilters.includes('reserve') ? 1 : 0) +
    selectedTags.length +
    selectedGoodFors.length +
    selectedPriceTiers.length +
    (selectedScoreFilter !== 'all' ? 1 : 0) +
    (selectedFriendFilter !== 'all' ? 1 : 0);
  const moreFiltersLabel = moreFiltersCount > 0
    ? `More Filters (${moreFiltersCount})`
    : 'More Filters';

  const filterOptions = useMemo(() => [
    { id: 'open_now', label: 'Open now' },
    { id: 'more_filters', label: moreFiltersLabel },
  ], [moreFiltersLabel]);

  const pillSelectedFilters = useMemo(() => {
    const cleaned = selectedFilters.filter(id => id !== 'more_filters');
    if (moreFiltersCount > 0) {
      return [...cleaned, 'more_filters'];
    }
    return cleaned;
  }, [selectedFilters, moreFiltersCount]);

  const selectedCityLabels = selectedCities
    .map(id => CITY_LOOKUP[id]?.label)
    .filter(Boolean) as string[];
  const selectedCuisineLabels = selectedCuisines
    .map(id => CUISINE_LOOKUP[id]?.label)
    .filter(Boolean) as string[];

  const selectedPriceLabels = selectedPriceTiers
    .map(id => PRICE_LOOKUP[id])
    .filter(Boolean) as string[];

  const filteredRestaurants = useMemo(() => {
    if (!searchQuery.trim()) return restaurants;
    const query = searchQuery.toLowerCase();
    return restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(query) ||
      restaurant.cuisine.some(c => c.toLowerCase().includes(query)) ||
      restaurant.location.neighborhood?.toLowerCase().includes(query)
    );
  }, [restaurants, searchQuery]);

  const sortedRestaurants = useMemo(() => {
    const restaurantsToSort = isSearchActive ? filteredRestaurants : restaurants;
    const sorted = [...restaurantsToSort];

    if (sortBy === 'rating') {
      // Sort by score (rating) - use averageScore or recScore
      sorted.sort((a, b) => {
        const scoreA = a.scores?.averageScore ?? a.scores?.recScore ?? 0;
        const scoreB = b.scores?.averageScore ?? b.scores?.recScore ?? 0;
        return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
      });
    } else if (sortBy === 'distance') {
      // Sort by distance
      sorted.sort((a, b) => {
        const distanceA = a.distance ?? Infinity;
        const distanceB = b.distance ?? Infinity;
        return sortOrder === 'asc' ? distanceA - distanceB : distanceB - distanceA;
      });
    }

    return sorted;
  }, [restaurants, filteredRestaurants, isSearchActive, sortBy, sortOrder]);

  const mapMarkers = useMemo(() => {
    const restaurantsToMap = isSearchActive ? filteredRestaurants : restaurants;
    return restaurantsToMap
      .map(restaurant => {
        const key = restaurant.name.toLowerCase();
        const override = COORDINATE_OVERRIDES[key];
        const coordinates = override ?? restaurant.location?.coordinates;
        if (!coordinates) return null;
        const neighborhood = override?.neighborhood ?? restaurant.location.neighborhood;
        return { restaurant, coordinates, neighborhood };
      })
      .filter((entry): entry is { restaurant: Restaurant; coordinates: { lat: number; lng: number }; neighborhood: string } => entry !== null);
  }, [restaurants, filteredRestaurants, isSearchActive]);

  const cityFilterDisplay = selectedCityLabels.length > 0
    ? summarizeSelectionLabels(selectedCityLabels, 'City')
    : undefined;

  const cuisineFilterDisplay = selectedCuisineLabels.length > 0
    ? summarizeSelectionLabels(selectedCuisineLabels, 'Cuisine')
    : undefined;

  const priceFilterDisplay = selectedPriceLabels.length > 0
    ? summarizeSelectionLabels(selectedPriceLabels, 'Price')
    : undefined;

  const dropdownFilters = [
    {
      id: 'city',
      label: 'City',
      options: CITY_FILTER_OPTIONS,
      displayLabel: cityFilterDisplay,
      isActive: selectedCities.length > 0,
      selectedOption: selectedCities[0],
    },
    {
      id: 'cuisine',
      label: 'Cuisine',
      options: CUISINE_FILTER_OPTIONS,
      displayLabel: cuisineFilterDisplay,
      isActive: selectedCuisines.length > 0,
      selectedOption: selectedCuisines[0],
    },
    {
      id: 'price',
      label: 'Price',
      options: PRICE_FILTER_OPTIONS,
      displayLabel: priceFilterDisplay,
      isActive: selectedPriceTiers.length > 0,
      selectedOption: selectedPriceTiers.length > 0 ? selectedPriceTiers[0] : 'all',
    },
  ];

  const pendingCityLabels = pendingCitySelection
    .map(id => CITY_LOOKUP[id]?.label)
    .filter(Boolean) as string[];
  const pendingCuisineLabels = pendingCuisineSelection
    .map(id => CUISINE_LOOKUP[id]?.label)
    .filter(Boolean) as string[];
  const pendingPriceLabels = pendingPriceSelection
    .map(id => PRICE_LOOKUP[id])
    .filter(Boolean) as string[];
  const pendingTagLabels = pendingTagSelection
    .map(id => TAG_OPTIONS.find(option => option.id === id)?.label)
    .filter(Boolean) as string[];
  const pendingGoodForLabels = pendingGoodForSelection
    .map(id => GOOD_FOR_OPTIONS.find(option => option.id === id)?.label)
    .filter(Boolean) as string[];

  const pendingCitySummary = summarizeSelectionLabels(pendingCityLabels, 'All cities');
  const pendingGoodForSummary = summarizeSelectionLabels(pendingGoodForLabels, 'All options');
  const pendingTagSummary = summarizeSelectionLabels(pendingTagLabels, 'All tags');
  const pendingPriceSummary = summarizeSelectionLabels(pendingPriceLabels, 'All prices');
  const pendingScoreSummary = SCORE_FILTER_OPTIONS.find(option => option.id === pendingScoreFilter)?.label ?? 'Any score';
  const pendingFriendSummary = FRIEND_FILTER_OPTIONS.find(option => option.id === pendingFriendFilter)?.label ?? 'Any count';

  useEffect(() => {
    initializeData();
  }, []);

  // Handle route params for taste profile filtering
  useEffect(() => {
    if (route.params?.filterType && route.params?.filterValue) {
      const { filterType, filterValue } = route.params;

      // Apply filter based on type
      if (filterType === 'cuisine') {
        // Find matching cuisine ID
        const cuisineOption = CUISINE_OPTIONS.find(
          opt => opt.label.toLowerCase() === filterValue.toLowerCase()
        );
        if (cuisineOption) {
          setSelectedCuisines([cuisineOption.id]);
        }
      } else if (filterType === 'city') {
        // Find matching city ID
        const cityOption = CITY_OPTIONS.find(
          opt => opt.city?.toLowerCase() === filterValue.toLowerCase()
        );
        if (cityOption) {
          setSelectedCities([cityOption.id]);
        }
      }
      // Note: Country filtering is not directly supported in current filter system
    }
  }, [route.params]);

  useEffect(() => {
    loadRestaurants();
  }, [
    selectedTab,
    selectedFilters,
    selectedCities,
    selectedCuisines,
    selectedTags,
    selectedGoodFors,
    selectedPriceTiers,
    sortBy,
    sortOrder,
    currentUser,
    selectedCategory,
  ]);

  useEffect(() => {
    if (!currentUser) return;

    const preloadCounts = async () => {
      try {
        const [beenLists, wantLists] = await Promise.all([
          MockDataService.getUserListsByType(currentUser.id, 'been', selectedCategory),
          MockDataService.getUserListsByType(currentUser.id, 'want_to_try', selectedCategory),
        ]);

        const beenIds = new Set(beenLists.flatMap(list => list.restaurants));
        const wantIds = new Set(wantLists.flatMap(list => list.restaurants));

        setListCounts(prev => ({
          ...prev,
          [`been-${selectedCategory}`]: beenIds.size,
          [`want-${selectedCategory}`]: wantIds.size,
        }));
      } catch (error) {
        console.error('Failed to preload list counts:', error);
      }
    };

    preloadCounts();
  }, [currentUser, selectedCategory]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      const user = await MockDataService.getCurrentUser();
      setCurrentUser(user);

      // Preload the default tab data
      await loadTabData('been', user, selectedCategory);
    } catch (error) {
      console.error('Failed to initialize data:', error);
    } finally {
      setLoading(false);
    }
  };

  const matchesCategory = (restaurant: Restaurant, category: ListCategory): boolean => {
    if (!category || category === 'restaurants') return true;

    const cuisines = restaurant.cuisine.map(c => c.toLowerCase());

    switch (category) {
      case 'bars':
        return cuisines.some(c => c.includes('bar'));
      case 'bakeries':
        return cuisines.some(c => c.includes('bakery'));
      case 'coffee_tea':
        return cuisines.some(c => c.includes('coffee') || c.includes('tea'));
      case 'dessert':
        return cuisines.some(c => c.includes('dessert') || c.includes('ice'));
      default:
        return true;
    }
  };

  const filterByCategory = (items: Restaurant[], category: ListCategory) =>
    items.filter(restaurant => matchesCategory(restaurant, category));

  const applyCityFilter = (items: Restaurant[]) => {
    if (selectedCities.length === 0) return items;

    const cityFilters = selectedCities
      .map(id => CITY_LOOKUP[id])
      .filter((option): option is CityOptionItem => Boolean(option && (option.city || option.state)));

    if (cityFilters.length === 0) {
      return items;
    }

    return items.filter(restaurant =>
      cityFilters.some(filter => {
        const cityMatch = filter.city
          ? restaurant.location.city.toLowerCase() === filter.city.toLowerCase()
          : true;
        const stateMatch = filter.state
          ? restaurant.location.state.toLowerCase() === filter.state.toLowerCase()
          : true;
        return cityMatch && stateMatch;
      })
    );
  };

  const applyCuisineFilter = (items: Restaurant[]) => {
    if (selectedCuisines.length === 0) return items;

    const cuisineFilters = selectedCuisines
      .map(id => CUISINE_LOOKUP[id]?.label.toLowerCase())
      .filter(Boolean) as string[];

    if (cuisineFilters.length === 0) {
      return items;
    }

    return items.filter(restaurant =>
      restaurant.cuisine.some(cuisine =>
        cuisineFilters.some(filterLabel => cuisine.toLowerCase() === filterLabel)
      )
    );
  };

  const applyTagFilter = (items: Restaurant[]) => {
    if (selectedTags.length === 0) return items;

    const normalizedSelection = selectedTags
      .map(tag => TAG_LOOKUP[tag])
      .filter(Boolean) as string[];

    return items.filter(restaurant => {
      const tags = restaurant.tags?.map(tag => tag.toLowerCase()) ?? [];
      return normalizedSelection.some(tag => tags.includes(tag));
    });
  };

  const applyGoodForFilter = (items: Restaurant[]) => {
    if (selectedGoodFors.length === 0) return items;

    const normalizedSelection = selectedGoodFors
      .map(option => GOOD_FOR_LOOKUP[option])
      .filter(Boolean) as string[];

    return items.filter(restaurant => {
      const tags = restaurant.tags?.map(tag => tag.toLowerCase()) ?? [];
      return normalizedSelection.some(option => tags.includes(option));
    });
  };

  const applyPriceFilter = (items: Restaurant[]) => {
    if (selectedPriceTiers.length === 0) return items;

    return items.filter(restaurant =>
      selectedPriceTiers.includes(restaurant.priceRange)
    );
  };

  const applyScoreFilter = (items: Restaurant[]) => {
    if (selectedScoreFilter === 'all') return items;
    const threshold = parseFloat(selectedScoreFilter);
    if (Number.isNaN(threshold)) return items;

    return items.filter(restaurant => restaurant.rating >= threshold);
  };

  const applyFriendFilter = (items: Restaurant[]) => {
    if (selectedFriendFilter === 'all') return items;
    const threshold = parseInt(selectedFriendFilter, 10);
    if (Number.isNaN(threshold)) return items;

    return items.filter(restaurant => {
      const friendScore = restaurant.scores?.friendScore ?? 0;
      return friendScore >= threshold;
    });
  };

  const loadTabData = async (tab: ListType, user: any, category: ListCategory) => {
    try {
      if (tab === 'more') {
        return;
      }

      const cacheKey = category;

      // Check cache first when no filters are applied
      const hasNoFilters =
        selectedFilters.length === 0 &&
        selectedCities.length === 0 &&
        selectedCuisines.length === 0 &&
        selectedTags.length === 0 &&
        selectedGoodFors.length === 0 &&
        selectedPriceTiers.length === 0;

      if (hasNoFilters && cachedData[tab] && cachedData[tab][cacheKey]) {
        setRestaurants(cachedData[tab][cacheKey]);
        return;
      }

      let restaurantIds: string[] = [];

      if (tab === 'been') {
        const beenList = await MockDataService.getUserListsByType(user.id, 'been', category);
        restaurantIds = beenList.flatMap(list => list.restaurants);
      } else if (tab === 'want') {
        const wantList = await MockDataService.getUserListsByType(user.id, 'want_to_try', category);
        restaurantIds = wantList.flatMap(list => list.restaurants);
      } else if (tab === 'recs') {
        const recsList = await MockDataService.getUserListsByType(user.id, 'recs', category);
        restaurantIds = recsList.flatMap(list => list.restaurants);
      } else if (tab === 'playlists') {
        const customLists = await MockDataService.getUserListsByType(user.id, 'playlists', category);
        restaurantIds = customLists.flatMap(list => list.restaurants);
      } else if (tab === 'recs_for_you') {
        const recommendations = await MockDataService.getRestaurantRecommendations(user.id);
        restaurantIds = filterByCategory(recommendations, category).map(r => r.id);
      } else if (tab === 'recs_from_friends') {
        const friendRecs = await MockDataService.getFriendRecommendations(user.id);
        restaurantIds = filterByCategory(friendRecs, category).map(r => r.id);
      } else if (tab === 'trending') {
        const trending = await MockDataService.getTrendingRestaurants();
        restaurantIds = filterByCategory(trending, category).map(r => r.id);
      }

      if (
        restaurantIds.length === 0 &&
        (tab === 'recs_for_you' || tab === 'recs_from_friends' || tab === 'trending')
      ) {
        const fallbackScopes: Array<'recs' | 'want_to_try' | 'playlists' | 'been'> = [
          'recs',
          'want_to_try',
          'playlists',
          'been',
        ];

        for (const scope of fallbackScopes) {
          const fallbackLists = await MockDataService.getUserListsByType(user.id, scope, category);
          const fallbackIds = Array.from(new Set(fallbackLists.flatMap(list => list.restaurants)));
          if (fallbackIds.length > 0) {
            restaurantIds = fallbackIds;
            break;
          }
        }
      }

      // Ensure unique IDs to avoid duplicates on screen
      restaurantIds = Array.from(new Set(restaurantIds));

      if (restaurantIds.length === 0) {
        setRestaurants([]);
        if (hasNoFilters) {
          setCachedData(prev => ({
            ...prev,
            [tab]: {
              ...(prev[tab] || {}),
              [cacheKey]: []
            }
          }));
        }
        return;
      }

      let restaurantsData = await MockDataService.getRestaurantsWithStatus(restaurantIds, {
        openNow: selectedFilters.includes('open_now'),
        acceptsReservations: selectedFilters.includes('reserve'),
        // Sorting is now handled by sortedRestaurants useMemo, not by the service
      });

      restaurantsData = filterByCategory(restaurantsData, category);
      restaurantsData = applyCityFilter(restaurantsData);
      restaurantsData = applyCuisineFilter(restaurantsData);
      restaurantsData = applyTagFilter(restaurantsData);
      restaurantsData = applyGoodForFilter(restaurantsData);
      restaurantsData = applyPriceFilter(restaurantsData);
      restaurantsData = applyScoreFilter(restaurantsData);
      restaurantsData = applyFriendFilter(restaurantsData);

      // Cache the data if no filters are applied
      if (hasNoFilters) {
        setCachedData(prev => ({
          ...prev,
          [tab]: {
            ...(prev[tab] || {}),
            [cacheKey]: restaurantsData
          }
        }));
      }

      setRestaurants(restaurantsData);

      if (tab === 'been' || tab === 'want') {
        setListCounts(prev => ({ ...prev, [`${tab}-${category}`]: restaurantsData.length }));
      }
    } catch (error) {
      console.error('Failed to load tab data:', error);
    }
  };

  const specialListOptions: ListType[] = ['recs_for_you', 'recs_from_friends', 'trending'];

  const handleSelectTab = (tabId: ListType) => {
    if (tabId === 'more') {
      setIsListPickerOpen(true);
      return;
    }

    setIsListPickerOpen(false);
    setSelectedTab(tabId);

    if (currentUser) {
      setLoading(true);
      loadTabData(tabId, currentUser, selectedCategory).finally(() => setLoading(false));
    }
  };

  const displayedTab = specialListOptions.includes(selectedTab) ? 'more' : selectedTab;

  const listOptionCount = (optionId: 'been' | 'want', category: ListCategory) => {
    const count = listCounts[`${optionId}-${category}`];
    return typeof count === 'number' ? `${count} restaurants` : '—';
  };

  const listOptions = [
    {
      id: 'been' as ListType,
      label: 'Been',
      description: listOptionCount('been', selectedCategory),
      icon: 'checkmark-circle',
    },
    {
      id: 'want' as ListType,
      label: 'Want to Try',
      description: listOptionCount('want', selectedCategory),
      icon: 'bookmark',
    },
    {
      id: 'recs_for_you' as ListType,
      label: 'Recs for You',
      description: 'Made for you!',
      icon: 'heart',
    },
    {
      id: 'playlists' as ListType,
      label: 'Playlists',
      description: 'Easily share recs!',
      icon: 'grid-outline',
    },
    {
      id: 'recs_from_friends' as ListType,
      label: 'Recs from Friends',
      description: 'Hand-picked!',
      icon: 'people-circle',
    },
    {
      id: 'trending' as ListType,
      label: 'Trending',
      description: 'On Beli now!',
      icon: 'trending-up',
    },
  ];

  const loadRestaurants = useCallback(async () => {
    if (!currentUser) return;

    // Clear existing debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // For filter changes, add debounce. For tab changes, load immediately
    const delay = 300;

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        await loadTabData(selectedTab, currentUser, selectedCategory);
      } finally {
        setLoading(false);
      }
    }, delay);
  }, [
    selectedTab,
    selectedFilters,
    selectedCities,
    selectedCuisines,
    selectedTags,
    selectedGoodFors,
    selectedPriceTiers,
    sortBy,
    sortOrder,
    currentUser,
    cachedData,
    selectedCategory,
  ]);

  const handleFilterPress = (filterId: string) => {
    if (filterId === 'more_filters') {
      setSelectedFilters(prev => prev.filter(id => id !== 'more_filters'));
      setPendingTagSelection(selectedTags);
      setPendingGoodForSelection(selectedGoodFors);
      setPendingPriceSelection(selectedPriceTiers);
      setPendingScoreFilter(selectedScoreFilter);
      setPendingFriendFilter(selectedFriendFilter);
      setPendingFilterToggles(selectedFilters);
      setTagSearch('');
      setGoodForSearch('');
      setExpandedSection(null);
      setIsAllFiltersOpen(true);
      return;
    }

    setSelectedFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleDropdownSelect = (filterId: string, optionId: string) => {
    if (filterId === 'city') {
      setSelectedCities(optionId === 'all' ? [] : [optionId]);
    } else if (filterId === 'cuisine') {
      setSelectedCuisines(optionId === 'all' ? [] : [optionId]);
    } else if (filterId === 'price') {
      setSelectedPriceTiers(optionId === 'all' ? [] : [optionId]);
    }
  };

  const handleSortToggle = () => {
    setSortBy(prev => {
      const newSortBy = prev === 'rating' ? 'distance' : 'rating';
      // Set appropriate sort order: desc for rating (highest first), asc for distance (closest first)
      setSortOrder(newSortBy === 'rating' ? 'desc' : 'asc');
      return newSortBy;
    });
  };

  const handleSearchPress = () => {
    if (viewMode === 'map') {
      // In map view, show modal with options
      setIsMapSearchModalVisible(true);
    } else {
      // In list view, toggle search bar
      setIsSearchActive(true);
      setSearchQuery('');
    }
  };

  const handleCloseSearch = () => {
    setIsSearchActive(false);
    setSearchQuery('');
  };

  const handleSearchThisList = () => {
    setIsMapSearchModalVisible(false);
    setIsSearchActive(true);
    setSearchQuery('');
  };

  const handleSearchAllPlaces = () => {
    setIsMapSearchModalVisible(false);
    navigation.navigate('Search');
  };

  const handleRestaurantPress = (restaurantId: string) => {
    navigation.navigate('RestaurantInfo', { restaurantId });
  };

  const handleViewMap = () => {
    setViewMode(prev => (prev === 'list' ? 'map' : 'list'));
  };

  const handleMapFilterPress = () => {
    // Open the existing comprehensive filters modal
    setPendingTagSelection(selectedTags);
    setPendingGoodForSelection(selectedGoodFors);
    setPendingPriceSelection(selectedPriceTiers);
    setPendingScoreFilter(selectedScoreFilter);
    setPendingFriendFilter(selectedFriendFilter);
    setPendingFilterToggles(selectedFilters);
    setTagSearch('');
    setGoodForSearch('');
    setExpandedSection(null);
    setIsAllFiltersOpen(true);
  };

  const handleMapLocatePress = () => {
    // Recenter map to Manhattan
    if (mapRef.current) {
      mapRef.current.animateToRegion(NYC_REGION, 500);
    }
  };

  const handleShare = async () => {
    try {
      const listName = tabs.find(tab => tab.id === selectedTab)?.label || 'My';
      await Share.share({
        message: `Check out my ${listName} list on Beli!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleMore = () => {
    setIsMoreOptionsVisible(true);
  };

  const handleDropdownPress = (dropdownId: string) => {
    if (dropdownId === 'city') {
      setPendingCitySelection(selectedCities);
      setCitySearch('');
      setIsCityModalVisible(true);
      return true;
    }

    if (dropdownId === 'cuisine') {
      setPendingCuisineSelection(selectedCuisines);
      setCuisineSearch('');
      setIsCuisineModalVisible(true);
      return true;
    }

    return false;
  };

  const togglePendingCitySelection = (cityId: string) => {
    setPendingCitySelection(prev =>
      prev.includes(cityId)
        ? prev.filter(id => id !== cityId)
        : [...prev, cityId]
    );
  };

  const togglePendingCuisineSelection = (cuisineId: string) => {
    setPendingCuisineSelection(prev =>
      prev.includes(cuisineId)
        ? prev.filter(id => id !== cuisineId)
        : [...prev, cuisineId]
    );
  };

  const togglePendingTagSelection = (tagId: string) => {
    setPendingTagSelection(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const togglePendingGoodForSelection = (optionId: string) => {
    setPendingGoodForSelection(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const togglePendingPriceSelection = (priceId: string) => {
    setPendingPriceSelection(prev =>
      prev.includes(priceId)
        ? prev.filter(id => id !== priceId)
        : [...prev, priceId]
    );
  };

  const togglePendingFilterToggle = (filterId: string) => {
    setPendingFilterToggles(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const clearPendingCities = () => setPendingCitySelection([]);
  const clearPendingCuisines = () => setPendingCuisineSelection([]);
  const clearPendingTags = () => setPendingTagSelection([]);
  const clearPendingGoodFors = () => setPendingGoodForSelection([]);
  const clearPendingPrices = () => setPendingPriceSelection([]);

  const applyCitySelection = () => {
    setSelectedCities(pendingCitySelection);
    setIsCityModalVisible(false);
  };

  const applyCuisineSelection = () => {
    setSelectedCuisines(pendingCuisineSelection);
    setIsCuisineModalVisible(false);
  };

  const applyAllFilters = () => {
    const nextFilters = pendingFilterToggles.filter(id => id !== 'more_filters');
    setSelectedFilters(nextFilters);
    setSelectedTags(pendingTagSelection);
    setSelectedGoodFors(pendingGoodForSelection);
    setSelectedPriceTiers(pendingPriceSelection);
    setSelectedCities(pendingCitySelection);
    setSelectedCuisines(pendingCuisineSelection);
    setSelectedScoreFilter(pendingScoreFilter);
    setSelectedFriendFilter(pendingFriendFilter);
    setTagSearch('');
    setGoodForSearch('');
    setExpandedSection(null);
    setIsAllFiltersOpen(false);
  };

  const clearAllFilters = () => {
    setPendingFilterToggles([]);
    clearPendingTags();
    clearPendingGoodFors();
    clearPendingPrices();
    setPendingScoreFilter('all');
    setPendingFriendFilter('all');
    setPendingCitySelection([]);
    setPendingCuisineSelection([]);
    setTagSearch('');
    setGoodForSearch('');
  };

  const closeAllFilters = () => {
    setIsAllFiltersOpen(false);
    setPendingFilterToggles(selectedFilters);
    setPendingTagSelection(selectedTags);
    setPendingGoodForSelection(selectedGoodFors);
    setPendingPriceSelection(selectedPriceTiers);
    setPendingScoreFilter(selectedScoreFilter);
    setPendingFriendFilter(selectedFriendFilter);
    setPendingCitySelection(selectedCities);
    setPendingCuisineSelection(selectedCuisines);
    setTagSearch('');
    setGoodForSearch('');
    setExpandedSection(null);
  };

  const renderFilterToggleButton = (filterId: string, label: string) => {
    const isSelected = pendingFilterToggles.includes(filterId);
    return (
      <Pressable
        key={filterId}
        style={[styles.filterToggle, isSelected && styles.filterToggleSelected]}
        onPress={() => togglePendingFilterToggle(filterId)}
      >
        <Text style={[styles.filterToggleLabel, isSelected && styles.filterToggleLabelSelected]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  const renderAccordionRow = (
    id: string,
    icon: keyof typeof Ionicons.glyphMap,
    title: string,
    summary: string,
    content: React.ReactNode,
  ) => (
    <View key={id} style={styles.accordionContainer}>
      <Pressable
        style={styles.accordionHeader}
        onPress={() => setExpandedSection(prev => (prev === id ? null : id))}
      >
        <View style={styles.accordionTitleWrapper}>
          <Ionicons name={icon} size={20} color={colors.textPrimary} style={styles.accordionIcon} />
          <View>
            <Text style={styles.accordionTitle}>{title}</Text>
            <Text style={styles.accordionSummary}>{summary}</Text>
          </View>
        </View>
        <Ionicons
          name={expandedSection === id ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textSecondary}
        />
      </Pressable>
      {expandedSection === id && (
        <View style={styles.accordionContent}>{content}</View>
      )}
    </View>
  );

  const filteredCityOptions = useMemo(() => {
    const search = citySearch.trim().toLowerCase();
    if (!search) return CITY_OPTIONS;
    return CITY_OPTIONS.filter(option => option.label.toLowerCase().includes(search));
  }, [citySearch]);

  const filteredCuisineOptions = useMemo(() => {
    const search = cuisineSearch.trim().toLowerCase();
    if (!search) return CUISINE_OPTIONS;
    return CUISINE_OPTIONS.filter(option => option.label.toLowerCase().includes(search));
  }, [cuisineSearch]);

  const filteredTagOptions = useMemo(() => {
    const search = tagSearch.trim().toLowerCase();
    if (!search) return TAG_OPTIONS;
    return TAG_OPTIONS.filter(option => option.label.toLowerCase().includes(search));
  }, [tagSearch]);

  const filteredGoodForOptions = useMemo(() => {
    const search = goodForSearch.trim().toLowerCase();
    if (!search) return GOOD_FOR_OPTIONS;
    return GOOD_FOR_OPTIONS.filter(option => option.label.toLowerCase().includes(search));
  }, [goodForSearch]);

  const pendingMoreFiltersCount = pendingTagSelection.length + pendingGoodForSelection.length + pendingPriceSelection.length;

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
      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>MY LISTS</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={handleShare} style={styles.headerButton}>
            <Ionicons name="share-outline" size={20} color={colors.textPrimary} />
          </Pressable>
          <Pressable onPress={handleMore} style={styles.headerButton}>
            <Ionicons name="ellipsis-horizontal" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Category Dropdown */}
      <View style={styles.categorySection}>
            <CategoryDropdown
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={(categoryId) => setSelectedCategory(categoryId as ListCategory)}
            />
          </View>

      {/* Tab Navigation */}
      <View style={styles.tabSection}>
        <TabSelector
          tabs={tabs}
          selectedTab={displayedTab}
          onTabPress={(tabId) => handleSelectTab(tabId as ListType)}
        />
      </View>

      {/* Filter Pills with Dropdowns */}
      <FilterPills
        filters={filterOptions}
        selectedFilters={pillSelectedFilters}
        onFilterPress={handleFilterPress}
        dropdownFilters={dropdownFilters}
        onDropdownSelect={handleDropdownSelect}
        onDropdownPress={handleDropdownPress}
        showIcon={true}
        style={styles.filterSection}
        orderedItems={[
          { type: 'dropdown', id: 'city' },
          { type: 'filter', id: 'open_now' },
          { type: 'dropdown', id: 'cuisine' },
          { type: 'dropdown', id: 'price' },
          { type: 'filter', id: 'more_filters' },
        ]}
      />

      {viewMode === 'list' && !isSearchActive && (
        <View style={styles.sortSection}>
          <SortToggle
            sortBy={sortBy === 'rating' ? 'Score' : 'Distance'}
            sortOrder={sortOrder}
            onPress={handleSortToggle}
          />
          <Pressable style={styles.searchButton} onPress={handleSearchPress}>
            <Ionicons name="search" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
      )}

      {viewMode === 'list' && isSearchActive && (
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBarWrapper}>
            <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchBarIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search your list"
              placeholderTextColor={colors.textSecondary}
              style={styles.searchBarInput}
              autoFocus
            />
          </View>
          <Pressable onPress={handleCloseSearch}>
            <Text style={styles.closeSearchText}>Close</Text>
          </Pressable>
        </View>
      )}

      {viewMode === 'list' ? (
        <FlatList
          style={styles.content}
          contentContainerStyle={styles.listContentContainer}
          data={sortedRestaurants}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <RestaurantListItem
              restaurant={item}
              rank={index + 1}
              showDistance={true}
              showStatus={true}
              isOpen={item.isOpen}
              closingTime={item.closingTime}
              onPress={() => handleRestaurantPress(item.id)}
            />
          )}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={100}
          windowSize={10}
        />
      ) : (
        <View style={[styles.content, styles.mapContainer]}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={NYC_REGION}
          >
            {mapMarkers.map(({ restaurant, coordinates, neighborhood }) => {
              const scoreColor = getScoreColor(restaurant.rating);
              return (
                <Marker
                  key={restaurant.id}
                  coordinate={{
                    latitude: coordinates.lat,
                    longitude: coordinates.lng,
                  }}
                  title={restaurant.name}
                  description={`${neighborhood} • ${restaurant.rating.toFixed(1)}`}
                  onPress={() => handleRestaurantPress(restaurant.id)}
                >
                  <View style={[styles.markerContainer, { backgroundColor: scoreColor }]}>
                    <Text style={styles.markerText}>{restaurant.rating.toFixed(1)}</Text>
                  </View>
                </Marker>
              );
            })}
          </MapView>

          <View style={styles.mapControlsContainer} pointerEvents="box-none">
            <View style={styles.mapControlsWrapper}>
              <Pressable style={styles.mapControlCircle} onPress={handleMapFilterPress}>
                <Ionicons name="options-outline" size={20} color={colors.textPrimary} />
              </Pressable>

              <Pressable style={styles.mapControlSearch} onPress={handleSearchPress}>
                <Text style={styles.mapControlSearchText}>Search Here</Text>
              </Pressable>

              <Pressable style={styles.mapControlCircle} onPress={handleMapLocatePress}>
                <Ionicons name="navigate-outline" size={20} color={colors.textPrimary} />
              </Pressable>
            </View>
          </View>
        </View>
      )}

      <ViewMapButton
        onPress={handleViewMap}
        style={{ bottom: mapButtonOffset }}
        variant="floating"
        viewMode={viewMode}
      />

      <Modal
        visible={isListPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsListPickerOpen(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setIsListPickerOpen(false)} />
          <View style={styles.sheetContent}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>List</Text>
              <Pressable onPress={() => setIsListPickerOpen(false)} style={styles.sheetCloseButton}>
                <Ionicons name="close" size={20} color={colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.sheetGrid}>
              {listOptions.map(option => {
                const isSelected = selectedTab === option.id;
                return (
                  <Pressable
                    key={option.id}
                    style={[
                      styles.sheetOption,
                      isSelected && styles.sheetOptionSelected,
                    ]}
                    onPress={() => handleSelectTab(option.id)}
                  >
                    <View style={styles.sheetOptionIconWrapper}>
                      <Ionicons
                        name={option.icon as keyof typeof Ionicons.glyphMap}
                        size={22}
                        color={isSelected ? colors.white : colors.textSecondary}
                      />
                    </View>
                    <Text style={[styles.sheetOptionLabel, isSelected && styles.sheetOptionLabelSelected]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.sheetOptionDescription, isSelected && styles.sheetOptionDescriptionSelected]}>
                      {option.description}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isAllFiltersOpen}
        transparent
        animationType="slide"
        onRequestClose={closeAllFilters}
      >
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={closeAllFilters} />
          <View style={styles.filterSheetContent}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filters</Text>
              <Pressable onPress={closeAllFilters} style={styles.sheetCloseButton}>
                <Ionicons name="close" size={20} color={colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalSection}>
                <Text style={styles.sectionHeading}>Category</Text>
                <View style={styles.categoryChoiceGrid}>
                  {categories.map(category => {
                    const isSelected = selectedCategory === category.id;
                    const iconName = CATEGORY_ICON_MAP[category.id as ListCategory];
                    return (
                      <Pressable
                        key={category.id}
                        style={[styles.categoryChoice, isSelected && styles.categoryChoiceSelected]}
                        onPress={() => setSelectedCategory(category.id as ListCategory)}
                      >
                        {iconName && (
                          <Ionicons
                            name={iconName}
                            size={18}
                            color={isSelected ? colors.white : colors.textPrimary}
                            style={styles.categoryChoiceIcon}
                          />
                        )}
                        <Text style={[styles.categoryChoiceLabel, isSelected && styles.categoryChoiceLabelSelected]}>
                          {category.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionHeading}>Sort by</Text>
                <View style={styles.segmentedControl}>
                  {SORT_SEGMENTS.map(option => {
                    const isActive = sortBy === option.id;
                    return (
                      <Pressable
                        key={option.id}
                        style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
                        onPress={() => setSortBy(option.id)}
                      >
                        <Text style={[styles.segmentButtonLabel, isActive && styles.segmentButtonLabelActive]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionHeading}>Filters</Text>
                <View style={styles.filterToggleRow}>
                  {renderFilterToggleButton('reserve', 'Reserve')}
                  {renderFilterToggleButton('open_now', 'Open now')}
                </View>
              </View>

              {renderAccordionRow(
                'city',
                'business-outline',
                'City',
                pendingCitySummary,
                <>
                  <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                      value={citySearch}
                      onChangeText={setCitySearch}
                      placeholder="Search City"
                      placeholderTextColor={colors.textSecondary}
                      style={styles.searchInput}
                    />
                  </View>
                  <View style={[styles.accordionList, styles.filterList]}>
                    {filteredCityOptions.map(item => {
                      const isSelected = pendingCitySelection.includes(item.id);
                      return (
                        <Pressable
                          key={item.id}
                          style={styles.filterListItem}
                          onPress={() => togglePendingCitySelection(item.id)}
                        >
                          <View style={styles.filterListLabelWrapper}>
                            {item.icon && (
                              <Ionicons
                                name={item.icon}
                                size={18}
                                color={item.accentColor || colors.textSecondary}
                                style={styles.filterListIcon}
                              />
                            )}
                            <Text
                              style={[
                                styles.filterListLabel,
                                item.accentColor && { color: item.accentColor },
                              ]}
                            >
                              {item.label}
                            </Text>
                          </View>
                          <Ionicons
                            name={isSelected ? 'checkbox-outline' : 'square-outline'}
                            size={22}
                            color={isSelected ? colors.primary : colors.textSecondary}
                          />
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}

              {renderAccordionRow(
                'good_for',
                'happy-outline',
                'Good For',
                pendingGoodForSummary,
                <>
                  <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                      value={goodForSearch}
                      onChangeText={setGoodForSearch}
                      placeholder="Search Good For"
                      placeholderTextColor={colors.textSecondary}
                      style={styles.searchInput}
                    />
                  </View>
                  <View style={[styles.accordionList, styles.filterList]}>
                    {filteredGoodForOptions.map(item => {
                      const isSelected = pendingGoodForSelection.includes(item.id);
                      return (
                        <Pressable
                          key={item.id}
                          style={styles.filterListItem}
                          onPress={() => togglePendingGoodForSelection(item.id)}
                        >
                          <View style={styles.filterListLabelWrapper}>
                            <Text style={styles.filterListLabel}>{item.label}</Text>
                          </View>
                          <Ionicons
                            name={isSelected ? 'checkbox-outline' : 'square-outline'}
                            size={22}
                            color={isSelected ? colors.primary : colors.textSecondary}
                          />
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}

              {renderAccordionRow(
                'score_filter',
                'stats-chart-outline',
                'Score',
                pendingScoreSummary,
                <View style={styles.optionPillRow}>
                  {SCORE_FILTER_OPTIONS.map(option => {
                    const isSelected = pendingScoreFilter === option.id;
                    return (
                      <Pressable
                        key={option.id}
                        style={[styles.optionPill, isSelected && styles.optionPillSelected]}
                        onPress={() => setPendingScoreFilter(option.id)}
                      >
                        <Text style={[styles.optionPillLabel, isSelected && styles.optionPillLabelSelected]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {renderAccordionRow(
                'friends_filter',
                'people-outline',
                'Number of friends',
                pendingFriendSummary,
                <View style={styles.optionPillRow}>
                  {FRIEND_FILTER_OPTIONS.map(option => {
                    const isSelected = pendingFriendFilter === option.id;
                    return (
                      <Pressable
                        key={option.id}
                        style={[styles.optionPill, isSelected && styles.optionPillSelected]}
                        onPress={() => setPendingFriendFilter(option.id)}
                      >
                        <Text style={[styles.optionPillLabel, isSelected && styles.optionPillLabelSelected]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {renderAccordionRow(
                'tags',
                'pricetag-outline',
                'Tags',
                pendingTagSummary,
                <>
                  <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                      value={tagSearch}
                      onChangeText={setTagSearch}
                      placeholder="Search Tags"
                      placeholderTextColor={colors.textSecondary}
                      style={styles.searchInput}
                    />
                  </View>
                  <View style={[styles.accordionList, styles.filterList]}>
                    {filteredTagOptions.map(item => {
                      const isSelected = pendingTagSelection.includes(item.id);
                      return (
                        <Pressable
                          key={item.id}
                          style={styles.filterListItem}
                          onPress={() => togglePendingTagSelection(item.id)}
                        >
                          <View style={styles.filterListLabelWrapper}>
                            <Text style={styles.filterListLabel}>{item.label}</Text>
                          </View>
                          <Ionicons
                            name={isSelected ? 'checkbox-outline' : 'square-outline'}
                            size={22}
                            color={isSelected ? colors.primary : colors.textSecondary}
                          />
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}

              {renderAccordionRow(
                'price_filter',
                'cash-outline',
                'Price',
                pendingPriceSummary,
                <View style={styles.optionPillRow}>
                  {PRICE_TIER_OPTIONS.map(option => {
                    const isSelected = pendingPriceSelection.includes(option.id);
                    return (
                      <Pressable
                        key={option.id}
                        style={[styles.optionPill, isSelected && styles.optionPillSelected]}
                        onPress={() => togglePendingPriceSelection(option.id)}
                      >
                        <Text style={[styles.optionPillLabel, isSelected && styles.optionPillLabelSelected]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            <View style={styles.filterFooter}>
              <Pressable onPress={clearAllFilters}>
                <Text style={styles.clearAllText}>Clear all</Text>
              </Pressable>
              <Pressable style={styles.applyButton} onPress={applyAllFilters}>
                <Text style={styles.applyButtonText}>
                  {pendingMoreFiltersCount > 0 ? `Apply (${pendingMoreFiltersCount})` : 'Apply'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isCityModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCityModalVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setIsCityModalVisible(false)} />
          <View style={styles.filterSheetContent}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>City</Text>
              <Pressable onPress={() => setIsCityModalVisible(false)} style={styles.sheetCloseButton}>
                <Ionicons name="close" size={20} color={colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                value={citySearch}
                onChangeText={setCitySearch}
                placeholder="Search City"
                placeholderTextColor={colors.textSecondary}
                style={styles.searchInput}
              />
            </View>

            <FlatList
              data={filteredCityOptions}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.filterList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = pendingCitySelection.includes(item.id);
                return (
                  <Pressable
                    style={styles.filterListItem}
                    onPress={() => togglePendingCitySelection(item.id)}
                  >
                    <View style={styles.filterListLabelWrapper}>
                      {item.icon && (
                        <Ionicons
                          name={item.icon}
                          size={18}
                          color={item.accentColor || colors.textSecondary}
                          style={styles.filterListIcon}
                        />
                      )}
                      <Text
                        style={[
                          styles.filterListLabel,
                          item.accentColor && { color: item.accentColor },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                    <Ionicons
                      name={isSelected ? 'checkbox-outline' : 'square-outline'}
                      size={22}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                  </Pressable>
                );
              }}
            />

            <View style={styles.filterFooter}>
              <Pressable onPress={clearPendingCities}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </Pressable>
              <Pressable style={styles.applyButton} onPress={applyCitySelection}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isCuisineModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCuisineModalVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setIsCuisineModalVisible(false)} />
          <View style={styles.filterSheetContent}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Cuisine</Text>
              <Pressable onPress={() => setIsCuisineModalVisible(false)} style={styles.sheetCloseButton}>
                <Ionicons name="close" size={20} color={colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                value={cuisineSearch}
                onChangeText={setCuisineSearch}
                placeholder="Search Cuisine"
                placeholderTextColor={colors.textSecondary}
                style={styles.searchInput}
              />
            </View>

            <FlatList
              data={filteredCuisineOptions}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.filterList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = pendingCuisineSelection.includes(item.id);
                return (
                  <Pressable
                    style={styles.filterListItem}
                    onPress={() => togglePendingCuisineSelection(item.id)}
                  >
                    <View style={styles.filterListLabelWrapper}>
                      <Text style={styles.filterListLabel}>{item.label}</Text>
                    </View>
                    <Ionicons
                      name={isSelected ? 'checkbox-outline' : 'square-outline'}
                      size={22}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                  </Pressable>
                );
              }}
            />

            <View style={styles.filterFooter}>
              <Pressable onPress={clearPendingCuisines}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </Pressable>
              <Pressable style={styles.applyButton} onPress={applyCuisineSelection}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Map Search Modal */}
      <Modal
        visible={isMapSearchModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMapSearchModalVisible(false)}
      >
        <Pressable
          style={styles.mapSearchOverlay}
          onPress={() => setIsMapSearchModalVisible(false)}
        >
          <View style={styles.mapSearchModal}>
            <Pressable style={styles.mapSearchOption} onPress={handleSearchThisList}>
              <Text style={styles.mapSearchOptionText}>Search this list</Text>
            </Pressable>
            <View style={styles.mapSearchDivider} />
            <Pressable style={styles.mapSearchOption} onPress={handleSearchAllPlaces}>
              <Text style={styles.mapSearchOptionText}>Search all places</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* More Options Modal */}
      <Modal
        visible={isMoreOptionsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsMoreOptionsVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setIsMoreOptionsVisible(false)} />
          <View style={styles.sheetContent}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>List Options</Text>
              <Pressable onPress={() => setIsMoreOptionsVisible(false)} style={styles.sheetCloseButton}>
                <Ionicons name="close" size={20} color={colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.moreOptionsContainer}>
              <Pressable
                style={styles.moreOption}
                onPress={() => {
                  setIsMoreOptionsVisible(false);
                  console.log('Edit List');
                }}
              >
                <Ionicons name="create-outline" size={22} color={colors.textPrimary} />
                <Text style={styles.moreOptionText}>Edit List</Text>
              </Pressable>

              <Pressable
                style={styles.moreOption}
                onPress={() => {
                  setIsMoreOptionsVisible(false);
                  console.log('Export List');
                }}
              >
                <Ionicons name="download-outline" size={22} color={colors.textPrimary} />
                <Text style={styles.moreOptionText}>Export List</Text>
              </Pressable>

              <Pressable
                style={styles.moreOption}
                onPress={() => {
                  setIsMoreOptionsVisible(false);
                  console.log('List Settings');
                }}
              >
                <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
                <Text style={styles.moreOptionText}>List Settings</Text>
              </Pressable>

              <Pressable
                style={[styles.moreOption, styles.moreOptionDestructive]}
                onPress={() => {
                  setIsMoreOptionsVisible(false);
                  console.log('Delete List');
                }}
              >
                <Ionicons name="trash-outline" size={22} color={colors.error} />
                <Text style={[styles.moreOptionText, styles.moreOptionTextDestructive]}>Delete List</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.edgePadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },

  headerSpacer: {
    flex: 1,
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 13,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    letterSpacing: 1.5,
  },

  headerActions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  headerButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },

  categorySection: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.edgePadding,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  tabSection: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.edgePadding,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  filterSection: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  sortSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.edgePadding,
    paddingVertical: spacing.sm,
  },

  searchButton: {
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    flex: 1,
    backgroundColor: colors.white,
  },

  listContentContainer: {
    paddingBottom: spacing['4xl'],
  },

  mapContainer: {
    backgroundColor: colors.white,
  },

  map: {
    flex: 1,
  },

  markerContainer: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.borderRadius.full,
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },

  markerText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },

  mapControlsContainer: {
    position: 'absolute',
    top: spacing.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  mapControlsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  mapControlCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xs,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  mapControlSearch: {
    minWidth: 148,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },

  mapControlSearchText: {
    color: colors.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },

  viewMapButton: {},

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000055',
  },

  sheetContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: spacing.borderRadius.xl,
    borderTopRightRadius: spacing.borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },

  sheetHandle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderMedium,
    marginBottom: spacing.lg,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },

  sheetTitle: {
    fontSize: 20,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },

  sheetCloseButton: {
    padding: spacing.xs,
  },

  sheetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  sheetOption: {
    width: '48%',
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },

  sheetOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  sheetOptionIconWrapper: {
    marginBottom: spacing.sm,
  },

  sheetOptionLabel: {
    fontSize: 16,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  sheetOptionLabelSelected: {
    color: colors.white,
  },

  sheetOptionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  sheetOptionDescriptionSelected: {
    color: colors.white,
  },

  filterSheetContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: spacing.borderRadius.xl,
    borderTopRightRadius: spacing.borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['2xl'],
    maxHeight: '80%',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },

  searchIcon: {
    marginRight: spacing.sm,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },

  filterList: {
    paddingBottom: spacing.lg,
  },

  filterListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  filterListLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },

  filterListIcon: {
    marginRight: spacing.sm,
  },

  filterListLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },

  filterSectionBlock: {
    marginBottom: spacing['2xl'],
  },

  filterSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  filterSectionIcon: {
    marginRight: spacing.sm,
  },

  filterSectionTitle: {
    fontSize: 18,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },

  priceOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },

  priceOption: {
    minWidth: 62,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    borderRadius: spacing.borderRadius.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xs,
    marginVertical: spacing.xs,
  },

  priceOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  priceOptionLabel: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },

  priceOptionLabelSelected: {
    color: colors.white,
  },

  modalSection: {
    marginBottom: spacing['2xl'],
  },

  sectionHeading: {
    fontSize: 18,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  categoryChoiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },

  categoryChoice: {
    width: '48%',
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
  },

  categoryChoiceSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  categoryChoiceIcon: {
    marginRight: spacing.sm,
  },

  categoryChoiceLabel: {
    fontSize: 16,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },

  categoryChoiceLabelSelected: {
    color: colors.white,
  },

  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.xl,
    padding: spacing.xs,
  },

  segmentButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  segmentButtonActive: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  segmentButtonLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },

  segmentButtonLabelActive: {
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },

  filterToggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  filterToggle: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    backgroundColor: colors.white,
  },

  filterToggleSelected: {
    backgroundColor: colors.primary + '12',
    borderColor: colors.primary,
  },

  filterToggleLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },

  filterToggleLabelSelected: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },

  accordionContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingVertical: spacing.md,
  },

  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  accordionTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  accordionIcon: {
    marginRight: spacing.md,
  },

  accordionTitle: {
    fontSize: 16,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },

  accordionSummary: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: colors.textSecondary,
  },

  accordionContent: {
    marginTop: spacing.md,
  },

  accordionList: {
    marginTop: spacing.sm,
  },

  optionPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  optionPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    backgroundColor: colors.white,
  },

  optionPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  optionPillLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },

  optionPillLabelSelected: {
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },

  filterFooter: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  clearAllText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },

  applyButton: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.primary,
  },

  applyButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: typography.weights.semibold,
  },

  // Search bar styles
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.edgePadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },

  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  searchBarIcon: {
    marginRight: spacing.sm,
  },

  searchBarInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },

  closeSearchText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },

  // Map search modal styles
  mapSearchOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  mapSearchModal: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.xl,
    width: '80%',
    maxWidth: 320,
    overflow: 'hidden',
  },

  mapSearchOption: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },

  mapSearchOptionText: {
    fontSize: 17,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },

  mapSearchDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },

  // More options modal styles
  moreOptionsContainer: {
    paddingTop: spacing.md,
  },

  moreOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  moreOptionDestructive: {
    borderBottomWidth: 0,
  },

  moreOptionText: {
    fontSize: 17,
    color: colors.textPrimary,
    marginLeft: spacing.md,
    fontWeight: typography.weights.medium,
  },

  moreOptionTextDestructive: {
    color: colors.error,
  },

  // Tastemaker posts styles
  postCardList: {
    padding: spacing.md,
  },

  postCardRow: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  postCardContainer: {
    width: '48%',
  },
});
