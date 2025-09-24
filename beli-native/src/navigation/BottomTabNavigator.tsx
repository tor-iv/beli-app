import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

// Import screens (we'll create these next)
import FeedScreen from '../screens/FeedScreen';
import ListsScreen from '../screens/ListsScreen';
import SearchScreen from '../screens/SearchScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Search') {
            return null;
          }

          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Feed') {
            iconName = focused ? 'document' : 'document-outline';
          } else if (route.name === 'Lists') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Leaderboard') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <View style={styles.divider} />
          </View>
        ),
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: {
          backgroundColor: colors.cardWhite,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '600',
          color: colors.textPrimary,
        },
      })}
    >
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Lists"
        component={ListsScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          headerShown: false,
          tabBarLabel: () => null,
          tabBarButton: ({ onPress, accessibilityRole, accessibilityState }) => {
            const focused = accessibilityState?.selected;
            return (
              <Pressable
                accessibilityRole={accessibilityRole}
                accessibilityState={accessibilityState}
                onPress={onPress}
                style={styles.searchTabButtonWrapper}
              >
                {({ pressed }) => (
                  <View
                    style={[
                      styles.searchTabButton,
                      focused ? styles.searchTabButtonActive : styles.searchTabButtonInactive,
                      pressed && styles.searchTabButtonPressed,
                    ]}
                  >
                    <Ionicons
                      name="add"
                      size={24}
                      color={colors.textInverse}
                    />
                  </View>
                )}
              </Pressable>
            );
          },
        }}
      />
      <Tab.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    height: spacing.tabBarHeight,
    paddingBottom: 20,
    paddingTop: 8,
  },

  tabBarBackground: {
    flex: 1,
    backgroundColor: colors.cardWhite,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },

  divider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
  },

  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  tabLabelInactive: {
    color: colors.textSecondary,
  },
  searchTabButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchTabButton: {
    width: 44,
    height: 44,
    borderRadius: spacing.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginBottom: spacing.xs,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  searchTabButtonInactive: {
    opacity: 0.75,
  },
  searchTabButtonActive: {
    opacity: 1,
  },
  searchTabButtonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
});
