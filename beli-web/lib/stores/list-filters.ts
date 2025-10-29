import { create } from 'zustand';

export interface ListFilters {
  // Category filter
  category: 'all' | 'restaurants' | 'bars' | 'bakeries' | 'coffee' | 'dessert';

  // Multi-select filters
  cities: string[];
  cuisines: string[];
  prices: ('$' | '$$' | '$$$' | '$$$$')[];
  tags: string[];
  goodFor: string[];

  // Score filter
  minScore: number | null; // 9.0, 8.5, 8.0, 7.5, or null for no filter

  // Friend filter
  minFriends: number | null; // 3, 5, 7, or null for no filter

  // Toggle filters
  openNow: boolean;
  acceptsReservations: boolean;

  // Search
  searchQuery: string;

  // Sort
  sortBy: 'rating' | 'distance' | 'friends';
  sortDirection: 'asc' | 'desc';
}

interface ListFiltersStore extends ListFilters {
  // Actions
  setCategory: (category: ListFilters['category']) => void;
  setCities: (cities: string[]) => void;
  addCity: (city: string) => void;
  removeCity: (city: string) => void;
  setCuisines: (cuisines: string[]) => void;
  addCuisine: (cuisine: string) => void;
  removeCuisine: (cuisine: string) => void;
  setPrices: (prices: ListFilters['prices']) => void;
  togglePrice: (price: '$' | '$$' | '$$$' | '$$$$') => void;
  setTags: (tags: string[]) => void;
  toggleTag: (tag: string) => void;
  setGoodFor: (goodFor: string[]) => void;
  toggleGoodFor: (option: string) => void;
  setMinScore: (score: number | null) => void;
  setMinFriends: (count: number | null) => void;
  setOpenNow: (value: boolean) => void;
  setAcceptsReservations: (value: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: ListFilters['sortBy']) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  resetFilters: () => void;
  clearAllFilters: () => void;
  getActiveFilterCount: () => number;
}

const initialState: ListFilters = {
  category: 'all',
  cities: [],
  cuisines: [],
  prices: [],
  tags: [],
  goodFor: [],
  minScore: null,
  minFriends: null,
  openNow: false,
  acceptsReservations: false,
  searchQuery: '',
  sortBy: 'rating',
  sortDirection: 'desc',
};

export const useListFilters = create<ListFiltersStore>((set, get) => ({
  ...initialState,

  setCategory: (category) => set({ category }),

  setCities: (cities) => set({ cities }),
  addCity: (city) => set((state) => ({ cities: [...state.cities, city] })),
  removeCity: (city) => set((state) => ({ cities: state.cities.filter((c) => c !== city) })),

  setCuisines: (cuisines) => set({ cuisines }),
  addCuisine: (cuisine) => set((state) => ({ cuisines: [...state.cuisines, cuisine] })),
  removeCuisine: (cuisine) => set((state) => ({ cuisines: state.cuisines.filter((c) => c !== cuisine) })),

  setPrices: (prices) => set({ prices }),
  togglePrice: (price) =>
    set((state) => ({
      prices: state.prices.includes(price)
        ? state.prices.filter((p) => p !== price)
        : [...state.prices, price],
    })),

  setTags: (tags) => set({ tags }),
  toggleTag: (tag) =>
    set((state) => ({
      tags: state.tags.includes(tag) ? state.tags.filter((t) => t !== tag) : [...state.tags, tag],
    })),

  setGoodFor: (goodFor) => set({ goodFor }),
  toggleGoodFor: (option) =>
    set((state) => ({
      goodFor: state.goodFor.includes(option)
        ? state.goodFor.filter((g) => g !== option)
        : [...state.goodFor, option],
    })),

  setMinScore: (minScore) => set({ minScore }),
  setMinFriends: (minFriends) => set({ minFriends }),
  setOpenNow: (openNow) => set({ openNow }),
  setAcceptsReservations: (acceptsReservations) => set({ acceptsReservations }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortDirection: (direction) => set({ sortDirection: direction }),

  resetFilters: () => set(initialState),

  clearAllFilters: () =>
    set({
      cities: [],
      cuisines: [],
      prices: [],
      tags: [],
      goodFor: [],
      minScore: null,
      minFriends: null,
      openNow: false,
      acceptsReservations: false,
    }),

  getActiveFilterCount: () => {
    const state = get();
    let count = 0;

    if (state.category !== 'all') count++;
    count += state.cities.length;
    count += state.cuisines.length;
    count += state.prices.length;
    count += state.tags.length;
    count += state.goodFor.length;
    if (state.minScore !== null) count++;
    if (state.minFriends !== null) count++;
    if (state.openNow) count++;
    if (state.acceptsReservations) count++;

    return count;
  },
}));

// Available filter options (matching native mobile app)
export const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'restaurants', label: 'Restaurants' },
  { value: 'bars', label: 'Bars' },
  { value: 'bakeries', label: 'Bakeries' },
  { value: 'coffee', label: 'Coffee & Tea' },
  { value: 'dessert', label: 'Ice Cream & Dessert' },
] as const;

export const CITIES = [
  'New York',
  'Los Angeles',
  'Chicago',
  'Houston',
  'Phoenix',
  'Philadelphia',
  'San Antonio',
  'San Diego',
  'Dallas',
  'San Jose',
  'Austin',
  'Jacksonville',
  'Fort Worth',
  'Columbus',
  'Charlotte',
  'San Francisco',
  'Indianapolis',
  'Seattle',
  'Denver',
  'Washington DC',
  'Boston',
  'El Paso',
  'Nashville',
  'Detroit',
  'Oklahoma City',
  'Portland',
  'Las Vegas',
  'Memphis',
  'Louisville',
  'Baltimore',
  'Milwaukee',
  'Albuquerque',
  'Tucson',
  'Fresno',
  'Mesa',
  'Sacramento',
  'Atlanta',
  'Kansas City',
  'Colorado Springs',
  'Omaha',
  'Raleigh',
  'Miami',
  'Long Beach',
  'Virginia Beach',
  'Oakland',
  'Minneapolis',
  'Tulsa',
  'Tampa',
  'Arlington',
  'New Orleans',
  'Wichita',
  'Cleveland',
  'Bakersfield',
  'Aurora',
  'Anaheim',
  'Honolulu',
  'Santa Ana',
  'Riverside',
  'Corpus Christi',
  'Lexington',
  'Stockton',
  'Henderson',
].sort();

export const CUISINES = [
  'American',
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Thai',
  'Indian',
  'French',
  'Mediterranean',
  'Greek',
  'Spanish',
  'Korean',
  'Vietnamese',
  'Middle Eastern',
  'Brazilian',
  'Caribbean',
  'Ethiopian',
  'Moroccan',
  'Turkish',
  'German',
  'British',
  'Irish',
  'Steakhouse',
  'Seafood',
  'Sushi',
  'Pizza',
  'Burger',
  'BBQ',
  'Vegetarian',
  'Vegan',
  'Fusion',
  'Contemporary',
].sort();

export const TAGS = [
  'Chef-Driven',
  'Date Night',
  'Brunch',
  'Late Night',
  'Outdoor Seating',
  'Live Music',
  'Rooftop',
  'Waterfront',
  'Historic',
  'Trendy',
  'Casual',
  'Upscale',
];

export const GOOD_FOR = [
  'Birthdays',
  'Anniversaries',
  'Business Dinners',
  'Group Dining',
  'Solo Dining',
  'Families',
  'Atmosphere',
  'AYCE (All You Can Eat)',
  'Happy Hour',
  'Wine List',
  'Craft Cocktails',
  'Breakfast',
  'Lunch',
  'Dinner',
];

export const SCORE_THRESHOLDS = [
  { value: 9.0, label: '9.0+' },
  { value: 8.5, label: '8.5+' },
  { value: 8.0, label: '8.0+' },
  { value: 7.5, label: '7.5+' },
];

export const FRIEND_THRESHOLDS = [
  { value: 3, label: '3+ friends' },
  { value: 5, label: '5+ friends' },
  { value: 7, label: '7+ friends' },
];
