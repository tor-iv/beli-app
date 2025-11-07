import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface NotificationSettings {
  follows: boolean;
  bookmarks: boolean;
  likes: boolean;
  comments: boolean;
  contactJoins: boolean;
  featuredLists: boolean;
  restaurantNews: boolean;
  sharedReservations: boolean; // required
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

export interface UserSettingsState {
  // Account
  email: string;
  phoneNumber: string;
  school?: string;
  company?: string;
  homeCity: string;

  // App Settings
  vibrationsDisabled: boolean;
  distanceUnit: 'Miles' | 'Kilometers';

  // Notifications
  notifications: NotificationSettings;

  // Privacy
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

  // Actions
  setEmail: (email: string) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setSchool: (school: string | undefined) => void;
  setCompany: (company: string | undefined) => void;
  setHomeCity: (homeCity: string) => void;
  setVibrationsDisabled: (disabled: boolean) => void;
  setDistanceUnit: (unit: 'Miles' | 'Kilometers') => void;
  setNotification: (key: keyof NotificationSettings, value: boolean) => void;
  setIsPublicAccount: (isPublic: boolean) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  muteUser: (userId: string) => void;
  unmuteUser: (userId: string) => void;
  setCookiePreference: (key: keyof CookiePreferences, value: boolean) => void;
  setDietaryRestrictions: (restrictions: string[]) => void;
  toggleDietaryRestriction: (restriction: string) => void;
  setDislikedCuisines: (cuisines: string[]) => void;
  toggleDislikedCuisine: (cuisine: string) => void;
  resetToDefaults: () => void;
}

const defaultState = {
  email: 'user@example.com',
  phoneNumber: '+1 (555) 123-4567',
  school: undefined,
  company: undefined,
  homeCity: 'New York, NY',
  vibrationsDisabled: false,
  distanceUnit: 'Miles' as const,
  notifications: {
    follows: true,
    bookmarks: true,
    likes: true,
    comments: true,
    contactJoins: true,
    featuredLists: true,
    restaurantNews: true,
    sharedReservations: true, // required
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
  invitesRemaining: 3,
};

export const useUserSettingsStore = create<UserSettingsState>()(
  persist(
    (set) => ({
      ...defaultState,

      setEmail: (email) => set({ email }),
      setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
      setSchool: (school) => set({ school, hasJoinedSchool: !!school }),
      setCompany: (company) => set({ company }),
      setHomeCity: (homeCity) => set({ homeCity }),

      setVibrationsDisabled: (disabled) => set({ vibrationsDisabled: disabled }),
      setDistanceUnit: (unit) => set({ distanceUnit: unit }),

      setNotification: (key, value) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: value,
          },
        })),

      setIsPublicAccount: (isPublic) => set({ isPublicAccount: isPublic }),

      blockUser: (userId) =>
        set((state) => ({
          blockedUsers: [...state.blockedUsers, userId],
        })),

      unblockUser: (userId) =>
        set((state) => ({
          blockedUsers: state.blockedUsers.filter((id) => id !== userId),
        })),

      muteUser: (userId) =>
        set((state) => ({
          mutedUsers: [...state.mutedUsers, userId],
        })),

      unmuteUser: (userId) =>
        set((state) => ({
          mutedUsers: state.mutedUsers.filter((id) => id !== userId),
        })),

      setCookiePreference: (key, value) =>
        set((state) => ({
          cookiePreferences: {
            ...state.cookiePreferences,
            [key]: value,
          },
        })),

      setDietaryRestrictions: (restrictions) => set({ dietaryRestrictions: restrictions }),

      toggleDietaryRestriction: (restriction) =>
        set((state) => {
          const exists = state.dietaryRestrictions.includes(restriction);
          return {
            dietaryRestrictions: exists
              ? state.dietaryRestrictions.filter((r) => r !== restriction)
              : [...state.dietaryRestrictions, restriction],
          };
        }),

      setDislikedCuisines: (cuisines) => set({ dislikedCuisines: cuisines }),

      toggleDislikedCuisine: (cuisine) =>
        set((state) => {
          const exists = state.dislikedCuisines.includes(cuisine);
          return {
            dislikedCuisines: exists
              ? state.dislikedCuisines.filter((c) => c !== cuisine)
              : [...state.dislikedCuisines, cuisine],
          };
        }),

      resetToDefaults: () => set(defaultState),
    }),
    {
      name: 'beli-user-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
