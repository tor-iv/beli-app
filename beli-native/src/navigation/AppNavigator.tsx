import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import BottomTabNavigator from './BottomTabNavigator';
import RestaurantInfoScreen from '../screens/RestaurantInfoScreen';
import ChallengeGoalScreen from '../screens/ChallengeGoalScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
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
    </Stack.Navigator>
  );
};

export default AppNavigator;
