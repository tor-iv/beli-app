export type BottomTabParamList = {
  Feed: undefined;
  Lists: undefined;
  Search: { autoFocus?: boolean } | undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  Tabs: undefined;
  RestaurantInfo: {
    restaurantId: string;
  };
};
