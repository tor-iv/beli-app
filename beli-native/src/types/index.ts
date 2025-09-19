export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  stats: {
    followers: number;
    following: number;
    rank: number;
    beenCount: number;
    wantToTryCount: number;
    currentStreak: number;
  };
  location: {
    city: string;
    state: string;
  };
  dietaryRestrictions: string[];
  dislikedCuisines: string[];
  memberSince: Date;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  location: {
    address: string;
    city: string;
    state: string;
    neighborhood: string;
    coordinates: { lat: number; lng: number };
  };
  rating: number; // 0-10 scale
  images: string[];
  hours?: Record<string, string>;
  phone?: string;
  website?: string;
  popularDishes: string[];
  tags: string[];
  scores: {
    recScore: number;
    friendScore: number;
  };
  distance?: number; // in miles
}

export interface UserRestaurantRelation {
  userId: string;
  restaurantId: string;
  status: 'been' | 'want_to_try' | 'recommended';
  rating?: number;
  notes?: string;
  photos?: string[];
  visitDate?: Date;
  createdAt: Date;
  tags?: string[];
  companions?: string[]; // user IDs
}

export interface FeedItem {
  id: string;
  restaurant: Restaurant;
  user: User;
  rating: number;
  comment: string;
  photos: string[];
  tags: string[];
  timestamp: Date;
  type: 'visit' | 'recommendation' | 'want_to_try';
}

export interface List {
  id: string;
  userId: string;
  name: string;
  description: string;
  restaurants: string[]; // restaurant IDs
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TabName = 'Feed' | 'Lists' | 'Search' | 'Leaderboard' | 'Profile';

export type ListType = 'been' | 'want_to_try' | 'recs' | 'playlists';
