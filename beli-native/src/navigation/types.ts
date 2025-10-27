export type BottomTabParamList = {
  Feed: undefined;
  Lists: { initialTab?: 'been' | 'recs' | 'playlists' | 'want' | 'recs_for_you' | 'recs_from_friends' | 'trending' } | undefined;
  Search: { autoFocus?: boolean } | undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  Tabs: undefined;
  RestaurantInfo: {
    restaurantId: string;
  };
  ChallengeGoal: undefined;
  Notifications: undefined;
  ReservationSharing: undefined;
  GroupDinner: undefined;
  FeaturedLists: undefined;

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
