// User types
export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  stats: UserStats;
  location: Location;
  dietaryRestrictions: string[];
  dislikedCuisines: string[];
  memberSince: Date;
}

export interface UserStats {
  followers: number;
  following: number;
  rank: number;
  beenCount: number;
  wantToTryCount: number;
  currentStreak: number;
  totalReviews?: number;
  challenge2025?: ChallengeGoal;
}

export interface ChallengeGoal {
  year: number;
  goalCount: number;
  currentCount: number;
  startDate: Date;
  endDate: Date;
}

export interface Location {
  city: string;
  state: string;
}

// Restaurant types
export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  rating: number;
  priceRange: string;
  location: RestaurantLocation;
  hours: Hours;
  phone: string;
  website?: string;
  images: string[];
  popularDishes: string[];
  distance?: number;
  tags?: string[];
  scores?: {
    recScore: number;
    friendScore: number;
    averageScore?: number;
    recScoreSampleSize?: number;
    friendScoreSampleSize?: number;
    averageScoreSampleSize?: number;
  };
  isOpen?: boolean;
  closingTime?: string | null;
  acceptsReservations?: boolean;
  ratingCount?: number;
  friendsWantToTryCount?: number;
  friendAvatars?: string[];
  popularDishImages?: string[];
}

export interface RestaurantLocation {
  address: string;
  city: string;
  state: string;
  neighborhood: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Hours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

// User-Restaurant Relation types
export interface UserRestaurantRelation {
  userId: string;
  restaurantId: string;
  status: 'been' | 'want_to_try' | 'recommended';
  rating?: number;
  notes?: string;
  photos?: string[];
  tags?: string[];
  createdAt: Date;
  visitDate?: Date;
  companions?: string[];
}

// Review types
export interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  rating: number;
  content: string;
  photos: string[];
  tags: string[];
  helpfulCount: number;
  createdAt: Date;
}

// Activity Feed types
export interface FeedItem {
  id: string;
  restaurant: Restaurant;
  user: User;
  rating: number;
  comment: string;
  photos: string[];
  tags: string[];
  timestamp: Date;
  createdAt?: Date; // Add optional createdAt for compatibility
  images?: string[]; // Add optional images for compatibility
  companions?: User[]; // Add optional companions for group visits
  type: 'visit' | 'review' | 'recommendation' | 'follow' | 'want_to_try' | 'bookmark';
}

export interface Activity extends FeedItem {
  interactions?: {
    likes: string[]; // user IDs who liked this
    comments: ActivityComment[];
    bookmarks: string[]; // user IDs who bookmarked
  };
}

export interface ActivityComment {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
}

// List types
export type ListCategory =
  | 'restaurants'
  | 'bars'
  | 'bakeries'
  | 'coffee_tea'
  | 'dessert'
  | 'other';

export type ListScope = 'been' | 'want_to_try' | 'recs' | 'playlists';

export interface List {
  id: string;
  userId: string;
  name: string;
  description: string;
  restaurants: string[]; // restaurant IDs
  isPublic: boolean;
  category: ListCategory;
  listType: ListScope;
  createdAt: Date;
  updatedAt: Date;
}

// Type aliases for screen compatibility
export type UserList = List;
