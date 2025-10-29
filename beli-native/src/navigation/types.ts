export type BottomTabParamList = {
  Feed: undefined;
  Lists: {
    initialTab?: 'been' | 'recs' | 'playlists' | 'want' | 'recs_for_you' | 'recs_from_friends' | 'trending';
    filterType?: 'cuisine' | 'city' | 'country';
    filterValue?: string;
    sortBy?: 'count' | 'avgScore';
  } | undefined;
  Search: { autoFocus?: boolean } | undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  Tabs: {
    screen?: keyof BottomTabParamList;
    params?: BottomTabParamList[keyof BottomTabParamList];
  } | undefined;
  RestaurantInfo: {
    restaurantId: string;
  };
  ChallengeGoal: undefined;
  Notifications: undefined;
  ReservationSharing: undefined;
  GroupDinner: undefined;
  Tastemakers: undefined;
  FeaturedListDetail: {
    listId: string;
  };
  UserProfile: {
    userId: string;
  };
  TastemakerPost: {
    postId: string;
  };

  // Settings Screens
  SettingsHub: undefined;
  AccountSettings: undefined;
  AppSettings: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  HelpScreen: undefined;

  // Feature Screens (from hamburger menu)
  ReservationsScreen: undefined;
  GoalScreen: undefined;
  FAQScreen: undefined;
  DietaryRestrictionsScreen: undefined;
  DislikedCuisinesScreen: undefined;
  ImportListScreen: undefined;
  ChangePasswordScreen: undefined;
  PrivacyPolicyScreen: undefined;

  // Sub-screens
  EmailChangeScreen: undefined;
  PhoneChangeScreen: undefined;
  PaymentMethodsScreen: undefined;
  SchoolSelectionScreen: undefined;
  CompanySettingsScreen: undefined;
  BlockedAccountsScreen: undefined;
  MutedAccountsScreen: undefined;
  CookiePreferencesScreen: undefined;
};
