import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationPreferences {
  follows: boolean;
  bookmarks: boolean;
  likes: boolean;
  comments: boolean;
  contactJoins: boolean;
  featuredLists: boolean;
  restaurantNews: boolean;
  sharedReservations: boolean;
  weeklyRankReminders: boolean;
  streakReminders: boolean;
  orderReminders: boolean;
  rankReminders: boolean;
}

export interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export interface UserSettings {
  // Account
  email: string;
  phoneNumber: string;
  school?: string;
  company?: string;
  homeCity: string;

  // App Settings
  vibrationsDisabled: boolean;
  distanceUnit: 'Miles' | 'Kilometers';

  // Notification Preferences
  notifications: NotificationPreferences;

  // Privacy Settings
  isPublicAccount: boolean;
  blockedUsers: string[];
  mutedUsers: string[];
  cookiePreferences: CookiePreferences;

  // Preferences
  dietaryRestrictions: string[];
  dislikedCuisines: string[];

  // Feature Flags
  hasJoinedSchool: boolean;
  hasSetGoal: boolean;
  invitesRemaining: number;
}

interface UserSettingsStore extends UserSettings {
  // Actions
  updateEmail: (email: string) => void;
  updatePhoneNumber: (phone: string) => void;
  updateHomeCity: (city: string) => void;
  updateVibrationsDisabled: (disabled: boolean) => void;
  updateDistanceUnit: (unit: 'Miles' | 'Kilometers') => void;
  updateNotificationPreference: (key: keyof NotificationPreferences, value: boolean) => void;
  updatePublicAccount: (isPublic: boolean) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  muteUser: (userId: string) => void;
  unmuteUser: (userId: string) => void;
  updateSchool: (school: string) => void;
  updateCompany: (company: string) => void;
  addDietaryRestriction: (restriction: string) => void;
  removeDietaryRestriction: (restriction: string) => void;
  addDislikedCuisine: (cuisine: string) => void;
  removeDislikedCuisine: (cuisine: string) => void;
  decrementInvites: () => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

const STORAGE_KEY = 'userSettings';

const defaultSettings: UserSettings = {
  email: 'vcox484@gmail.com',
  phoneNumber: '+16519559920',
  homeCity: 'New York, NY',
  vibrationsDisabled: false,
  distanceUnit: 'Miles',
  notifications: {
    follows: true,
    bookmarks: true,
    likes: true,
    comments: true,
    contactJoins: true,
    featuredLists: true,
    restaurantNews: true,
    sharedReservations: true,
    weeklyRankReminders: true,
    streakReminders: true,
    orderReminders: true,
    rankReminders: true,
  },
  isPublicAccount: true,
  blockedUsers: [],
  mutedUsers: [],
  cookiePreferences: {
    analytics: true,
    marketing: false,
    functional: true,
  },
  dietaryRestrictions: [],
  dislikedCuisines: [],
  hasJoinedSchool: false,
  hasSetGoal: false,
  invitesRemaining: 4,
};

export const useUserSettingsStore = create<UserSettingsStore>((set, get) => ({
  ...defaultSettings,

  // Actions
  updateEmail: (email) => {
    set({ email });
    get().saveSettings();
  },

  updatePhoneNumber: (phoneNumber) => {
    set({ phoneNumber });
    get().saveSettings();
  },

  updateHomeCity: (homeCity) => {
    set({ homeCity });
    get().saveSettings();
  },

  updateVibrationsDisabled: (vibrationsDisabled) => {
    set({ vibrationsDisabled });
    get().saveSettings();
  },

  updateDistanceUnit: (distanceUnit) => {
    set({ distanceUnit });
    get().saveSettings();
  },

  updateNotificationPreference: (key, value) => {
    set((state) => ({
      notifications: {
        ...state.notifications,
        [key]: value,
      },
    }));
    get().saveSettings();
  },

  updatePublicAccount: (isPublicAccount) => {
    set({ isPublicAccount });
    get().saveSettings();
  },

  blockUser: (userId) => {
    set((state) => ({
      blockedUsers: [...state.blockedUsers, userId],
    }));
    get().saveSettings();
  },

  unblockUser: (userId) => {
    set((state) => ({
      blockedUsers: state.blockedUsers.filter((id) => id !== userId),
    }));
    get().saveSettings();
  },

  muteUser: (userId) => {
    set((state) => ({
      mutedUsers: [...state.mutedUsers, userId],
    }));
    get().saveSettings();
  },

  unmuteUser: (userId) => {
    set((state) => ({
      mutedUsers: state.mutedUsers.filter((id) => id !== userId),
    }));
    get().saveSettings();
  },

  updateSchool: (school) => {
    set({ school, hasJoinedSchool: true });
    get().saveSettings();
  },

  updateCompany: (company) => {
    set({ company });
    get().saveSettings();
  },

  addDietaryRestriction: (restriction) => {
    set((state) => ({
      dietaryRestrictions: [...state.dietaryRestrictions, restriction],
    }));
    get().saveSettings();
  },

  removeDietaryRestriction: (restriction) => {
    set((state) => ({
      dietaryRestrictions: state.dietaryRestrictions.filter((r) => r !== restriction),
    }));
    get().saveSettings();
  },

  addDislikedCuisine: (cuisine) => {
    set((state) => ({
      dislikedCuisines: [...state.dislikedCuisines, cuisine],
    }));
    get().saveSettings();
  },

  removeDislikedCuisine: (cuisine) => {
    set((state) => ({
      dislikedCuisines: state.dislikedCuisines.filter((c) => c !== cuisine),
    }));
    get().saveSettings();
  },

  decrementInvites: () => {
    set((state) => ({
      invitesRemaining: Math.max(0, state.invitesRemaining - 1),
    }));
    get().saveSettings();
  },

  loadSettings: async () => {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        set(settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },

  saveSettings: async () => {
    try {
      const state = get();
      const settingsToSave: UserSettings = {
        email: state.email,
        phoneNumber: state.phoneNumber,
        school: state.school,
        company: state.company,
        homeCity: state.homeCity,
        vibrationsDisabled: state.vibrationsDisabled,
        distanceUnit: state.distanceUnit,
        notifications: state.notifications,
        isPublicAccount: state.isPublicAccount,
        blockedUsers: state.blockedUsers,
        mutedUsers: state.mutedUsers,
        cookiePreferences: state.cookiePreferences,
        dietaryRestrictions: state.dietaryRestrictions,
        dislikedCuisines: state.dislikedCuisines,
        hasJoinedSchool: state.hasJoinedSchool,
        hasSetGoal: state.hasSetGoal,
        invitesRemaining: state.invitesRemaining,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },
}));
