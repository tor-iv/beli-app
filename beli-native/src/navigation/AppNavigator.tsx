import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import BottomTabNavigator from './BottomTabNavigator';
import RestaurantInfoScreen from '../screens/RestaurantInfoScreen';
import ChallengeGoalScreen from '../screens/ChallengeGoalScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ReservationSharingScreen from '../screens/ReservationSharingScreen';
import GroupDinnerScreen from '../screens/GroupDinnerScreen';
import FeaturedListsScreen from '../screens/FeaturedListsScreen';
import FeaturedListDetailScreen from '../screens/FeaturedListDetailScreen';
import UserProfileScreen from '../screens/UserProfileScreen';

// Settings Screens
import SettingsHubScreen from '../screens/SettingsHubScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import AppSettingsScreen from '../screens/AppSettingsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import PrivacySettingsScreen from '../screens/PrivacySettingsScreen';

// Placeholder Screens
import {
  HelpScreen,
  ReservationsScreen,
  GoalScreen,
  FAQScreen,
  DietaryRestrictionsScreen,
  DislikedCuisinesScreen,
  ImportListScreen,
  ChangePasswordScreen,
  PrivacyPolicyScreen,
  EmailChangeScreen,
  PhoneChangeScreen,
  PaymentMethodsScreen,
  SchoolSelectionScreen,
  CompanySettingsScreen,
  BlockedAccountsScreen,
  MutedAccountsScreen,
  CookiePreferencesScreen,
} from '../screens/PlaceholderScreens';

import type { AppStackParamList } from './types';

const Stack = createStackNavigator<AppStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Tabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RestaurantInfo"
        component={RestaurantInfoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChallengeGoal"
        component={ChallengeGoalScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReservationSharing"
        component={ReservationSharingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GroupDinner"
        component={GroupDinnerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FeaturedLists"
        component={FeaturedListsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FeaturedListDetail"
        component={FeaturedListDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ headerShown: false }}
      />

      {/* Settings Screens */}
      <Stack.Screen name="SettingsHub" component={SettingsHubScreen} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <Stack.Screen name="HelpScreen" component={HelpScreen} />

      {/* Feature Screens */}
      <Stack.Screen name="ReservationsScreen" component={ReservationsScreen} />
      <Stack.Screen name="GoalScreen" component={GoalScreen} />
      <Stack.Screen name="FAQScreen" component={FAQScreen} />
      <Stack.Screen name="DietaryRestrictionsScreen" component={DietaryRestrictionsScreen} />
      <Stack.Screen name="DislikedCuisinesScreen" component={DislikedCuisinesScreen} />
      <Stack.Screen name="ImportListScreen" component={ImportListScreen} />
      <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
      <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />

      {/* Sub-screens */}
      <Stack.Screen name="EmailChangeScreen" component={EmailChangeScreen} />
      <Stack.Screen name="PhoneChangeScreen" component={PhoneChangeScreen} />
      <Stack.Screen name="PaymentMethodsScreen" component={PaymentMethodsScreen} />
      <Stack.Screen name="SchoolSelectionScreen" component={SchoolSelectionScreen} />
      <Stack.Screen name="CompanySettingsScreen" component={CompanySettingsScreen} />
      <Stack.Screen name="BlockedAccountsScreen" component={BlockedAccountsScreen} />
      <Stack.Screen name="MutedAccountsScreen" component={MutedAccountsScreen} />
      <Stack.Screen name="CookiePreferencesScreen" component={CookiePreferencesScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
