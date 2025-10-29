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
  isTastemaker?: boolean;
  tastemakerProfile?: TastemakerProfile;
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
  hours?: Hours;
  phone?: string;
  website?: string;
  images: string[];
  popularDishes: string[];
  distance?: number;
  tags?: string[];
  goodFor?: string[]; // Good for options (Birthdays, Business Dinners, etc.)
  category?: ListCategory; // Category for filtering (restaurants, bars, bakeries, etc.)
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
  recommendedBy?: string[]; // user IDs who recommended this restaurant
  ratingCount?: number;
  friendsWantToTryCount?: number;
  friendAvatars?: string[];
  popularDishImages?: string[];
  menu?: string[]; // array of menu item IDs
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
  rankIndex?: number; // Position in ranked list (0 = highest rank)
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
  thumbnailImage?: string; // optional thumbnail for featured lists
  createdAt: Date;
  updatedAt: Date;
}

// Type aliases for screen compatibility
export type UserList = List;

// Notification types
export type NotificationType =
  | 'rating_liked'      // Someone liked your rating
  | 'bookmark_liked'    // Someone liked your bookmark
  | 'comment'           // Someone commented
  | 'follow'            // Someone followed you
  | 'list_bookmark'     // Someone bookmarked from your list
  | 'streak'            // Streak achievement
  | 'recommendation';   // Someone recommended a place

export interface Notification {
  id: string;
  type: NotificationType;
  actorUser?: User;           // The user who performed the action
  targetRestaurant?: Restaurant; // Restaurant involved
  targetList?: string;        // List name if applicable
  commentText?: string;       // For comment notifications
  streakCount?: number;       // For streak notifications
  timestamp: Date;
  isRead: boolean;
  actionDescription: string;  // "liked your rating of", "commented on your bookmarking of"
}

// Tastemaker types
export type TastemakerBadgeType =
  | 'pizza_expert'
  | 'michelin_hunter'
  | 'budget_guru'
  | 'vegan_queen'
  | 'fine_dining_specialist'
  | 'street_food_explorer'
  | 'brunch_master'
  | 'dessert_connoisseur'
  | 'ramen_specialist'
  | 'wine_expert'
  | 'verified';

export interface TastemakerBadge {
  type: TastemakerBadgeType;
  label: string;
  color: string; // hex color for badge
  icon?: string; // emoji or icon name
}

export interface TastemakerProfile {
  specialty: string; // Main focus area (e.g., "NYC Pizza Expert")
  tagline: string; // Short memorable tagline
  badges: TastemakerBadge[];
  featuredListsCount: number;
  totalPosts: number;
  engagementRate: number; // percentage
  verifiedSince?: Date;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

export interface TastemakerPost {
  id: string;
  userId: string; // Author (must be a tastemaker)
  user?: User; // Populated user object
  title: string;
  subtitle?: string;
  coverImage: string;
  content: string; // Rich text/markdown content
  restaurantIds: string[]; // Featured restaurants in the post
  restaurants?: Restaurant[]; // Populated restaurant objects
  listIds?: string[]; // Referenced lists
  tags: string[]; // Content tags (e.g., "pizza", "budget-friendly", "date-night")
  publishedAt: Date;
  updatedAt: Date;
  interactions: {
    likes: string[]; // user IDs
    bookmarks: string[]; // user IDs
    views: number;
  };
  isFeatured: boolean; // Featured on homepage
}

// Reservation types
export type ReservationStatus = 'available' | 'claimed' | 'shared' | 'cancelled';
export type PriorityLevel = 'SC' | 'Gold' | 'Silver' | 'Bronze';

export interface Reservation {
  id: string;
  restaurantId: string;
  restaurant: Restaurant;
  userId: string; // Original reservation owner
  user: User;
  dateTime: Date;
  partySize: number;
  status: ReservationStatus;
  claimedBy?: string; // User ID who claimed it
  sharedWith?: string[]; // User IDs reservation is shared with
  createdAt: Date;
  notes?: string;
}

export interface ReservationPriorityLevel {
  userId: string;
  level: PriorityLevel;
  invitesSent: number;
  reservationsShared: number;
  nextLevelProgress: number; // 0-100 percentage to next level
  nextLevel?: PriorityLevel;
}

// Menu and Ordering types
export type MenuItemCategory = 'appetizer' | 'entree' | 'side' | 'dessert' | 'drink';
export type PortionSize = 'small' | 'medium' | 'large' | 'shareable';
export type HungerLevel = 'light' | 'moderate' | 'very-hungry';
export type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'any-time';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuItemCategory;
  imageUrl: string;
  portionSize: PortionSize;
  tags: string[];
  popularity: number; // 0-100 score
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  spiceLevel?: 1 | 2 | 3 | 4 | 5;
  mealTime?: MealTime[]; // Which meals this item is suitable for
}

export interface OrderSuggestion {
  id: string;
  restaurantId: string;
  partySize: number;
  hungerLevel: HungerLevel;
  mealTime: MealTime;
  items: Array<MenuItem & { quantity: number }>;
  totalPrice: number;
  reasoning: string[];
  estimatedSharability: string; // e.g., "Perfect for 4 people"
}

// Group Dinner types
export interface GroupDinnerSession {
  id: string;
  userId: string;
  participants: string[]; // user IDs (can be empty for solo)
  selectedRestaurant?: string;
  createdAt: Date;
}

export interface GroupDinnerMatch {
  restaurant: Restaurant;
  score: number;
  onListsCount: number; // how many want-to-try lists
  participants: string[]; // who has it on their list
  matchReasons: string[];
  availability?: {
    date: string;
    timeSlot: string;
  };
}

// Taste Profile types
export interface CuisineBreakdown {
  cuisine: string;
  count: number;
  avgScore: number;
  restaurantIds: string[];
}

export interface CityBreakdown {
  city: string;
  state?: string;
  count: number;
  avgScore: number;
  restaurantIds: string[];
}

export interface CountryBreakdown {
  country: string;
  count: number;
  avgScore: number;
  restaurantIds: string[];
}

export interface DiningLocation {
  city: string;
  country: string;
  state?: string;
  lat: number;
  lng: number;
  restaurantIds: string[];
}

export interface Last30DaysStats {
  restaurantsCount: number;
  cuisinesCount: number;
  activityPercentile: number; // e.g., 96 means "Top 4%"
  primaryLocation: string; // e.g., "New York"
}

export interface TasteProfileStats {
  last30Days: Last30DaysStats;
  cuisineBreakdown: CuisineBreakdown[];
  cityBreakdown: CityBreakdown[];
  countryBreakdown: CountryBreakdown[];
  diningLocations: DiningLocation[];
  totalRestaurants: number;
  totalCities: number;
  totalCountries: number;
  totalCuisines: number;
}

// Ranking types
export type InitialSentiment = 'liked' | 'fine' | 'disliked';

export interface RankingComparison {
  restaurantId: string;
  choice: 'left' | 'right' | 'skip';
  leftBound: number;
  rightBound: number;
  comparisonRestaurantId: string;
}

export interface RankingState {
  targetRestaurantId: string;
  category: ListCategory;
  initialSentiment: InitialSentiment;
  rankedList: Restaurant[];
  comparisonHistory: RankingComparison[];
  currentLeftBound: number;
  currentRightBound: number;
  skipsRemaining: number;
  isComplete: boolean;
}

export interface RankingResult {
  restaurantId: string;
  category: ListCategory;
  finalPosition: number;
  totalRestaurants: number;
  rating: number;           // 0-10 scale
  percentile: number;       // 0-100
  comparisonsCount: number;
}
