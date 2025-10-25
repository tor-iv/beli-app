import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import { useUserSettingsStore } from '../store/userSettingsStore';
import JoinSchoolModal from '../components/modals/JoinSchoolModal';

// Generic placeholder component
function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>This screen is coming soon</Text>
    </View>
  );
}

// Help Screen
type HelpScreenProps = NativeStackScreenProps<AppStackParamList, 'HelpScreen'>;
export function HelpScreen({ navigation }: HelpScreenProps) {
  React.useLayoutEffect(() => {
    navigation.setOptions({ title: 'Help' });
  }, [navigation]);
  return <PlaceholderScreen title="Help & Support" />;
}

// Reservations Screen
type ReservationsScreenProps = NativeStackScreenProps<AppStackParamList, 'ReservationsScreen'>;
export function ReservationsScreen({ navigation }: ReservationsScreenProps) {
  React.useLayoutEffect(() => {
    navigation.setOptions({ title: 'Your Reservations' });
  }, [navigation]);
  return <PlaceholderScreen title="Your Reservations" />;
}

// Goal Screen - Implemented as ChallengeGoalScreen
export { default as GoalScreen } from './ChallengeGoalScreen';

// FAQ Screen - Implemented in separate file
export { default as FAQScreen } from './FAQScreen';

// Dietary Restrictions Screen - Implemented in separate file
export { default as DietaryRestrictionsScreen } from './DietaryRestrictionsScreen';

// Disliked Cuisines Screen - Implemented in separate file
export { default as DislikedCuisinesScreen } from './DislikedCuisinesScreen';

// Import List Screen
type ImportListScreenProps = NativeStackScreenProps<AppStackParamList, 'ImportListScreen'>;
export function ImportListScreen({ navigation }: ImportListScreenProps) {
  React.useLayoutEffect(() => {
    navigation.setOptions({ title: 'Import List' });
  }, [navigation]);
  return <PlaceholderScreen title="Import Existing List" />;
}

// Change Password Screen - Implemented in separate file
export { default as ChangePasswordScreen } from './ChangePasswordScreen';

// Privacy Policy Screen - Implemented in separate file
export { default as PrivacyPolicyScreen } from './PrivacyPolicyScreen';

// Email Change Screen
type EmailChangeScreenProps = NativeStackScreenProps<AppStackParamList, 'EmailChangeScreen'>;
export function EmailChangeScreen({ navigation }: EmailChangeScreenProps) {
  React.useLayoutEffect(() => {
    navigation.setOptions({ title: 'Change Email' });
  }, [navigation]);
  return <PlaceholderScreen title="Change Email" />;
}

// Phone Change Screen
type PhoneChangeScreenProps = NativeStackScreenProps<AppStackParamList, 'PhoneChangeScreen'>;
export function PhoneChangeScreen({ navigation }: PhoneChangeScreenProps) {
  React.useLayoutEffect(() => {
    navigation.setOptions({ title: 'Change Phone Number' });
  }, [navigation]);
  return <PlaceholderScreen title="Change Phone Number" />;
}

// Payment Methods Screen
type PaymentMethodsScreenProps = NativeStackScreenProps<AppStackParamList, 'PaymentMethodsScreen'>;
export function PaymentMethodsScreen({ navigation }: PaymentMethodsScreenProps) {
  React.useLayoutEffect(() => {
    navigation.setOptions({ title: 'Payment Methods' });
  }, [navigation]);
  return <PlaceholderScreen title="Manage Payment Methods" />;
}

// School Selection Screen
type SchoolSelectionScreenProps = NativeStackScreenProps<AppStackParamList, 'SchoolSelectionScreen'>;
export function SchoolSelectionScreen({ navigation }: SchoolSelectionScreenProps) {
  const { hasJoinedSchool } = useUserSettingsStore();
  const [showJoinModal, setShowJoinModal] = useState(!hasJoinedSchool);

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: 'Add School' });
  }, [navigation]);

  const handleJoin = () => {
    setShowJoinModal(false);
    // Modal closed, now show school selection
  };

  const handleDismiss = () => {
    setShowJoinModal(false);
    navigation.goBack();
  };

  if (showJoinModal) {
    return (
      <JoinSchoolModal
        visible={showJoinModal}
        onJoin={handleJoin}
        onDismiss={handleDismiss}
      />
    );
  }

  return <PlaceholderScreen title="Select Your School" />;
}

// Company Settings Screen
type CompanySettingsScreenProps = NativeStackScreenProps<AppStackParamList, 'CompanySettingsScreen'>;
export function CompanySettingsScreen({ navigation }: CompanySettingsScreenProps) {
  React.useLayoutEffect(() => {
    navigation.setOptions({ title: 'Company Settings' });
  }, [navigation]);
  return <PlaceholderScreen title="Company Settings" />;
}

// Blocked Accounts Screen
type BlockedAccountsScreenProps = NativeStackScreenProps<AppStackParamList, 'BlockedAccountsScreen'>;
export function BlockedAccountsScreen({ navigation }: BlockedAccountsScreenProps) {
  React.useLayoutEffect(() => {
    navigation.setOptions({ title: 'Blocked Accounts' });
  }, [navigation]);
  return <PlaceholderScreen title="Blocked Accounts" />;
}

// Muted Accounts Screen
type MutedAccountsScreenProps = NativeStackScreenProps<AppStackParamList, 'MutedAccountsScreen'>;
export function MutedAccountsScreen({ navigation }: MutedAccountsScreenProps) {
  React.useLayoutEffect(() => {
    navigation.setOptions({ title: 'Muted Accounts' });
  }, [navigation]);
  return <PlaceholderScreen title="Muted Accounts" />;
}

// Cookie Preferences Screen
type CookiePreferencesScreenProps = NativeStackScreenProps<AppStackParamList, 'CookiePreferencesScreen'>;
export function CookiePreferencesScreen({ navigation }: CookiePreferencesScreenProps) {
  React.useLayoutEffect(() => {
    navigation.setOptions({ title: 'Cookie Preferences' });
  }, [navigation]);
  return <PlaceholderScreen title="Manage Cookies" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.offWhite,
    padding: spacing.xl,
  },
  title: {
    ...typography.textStyles.h2,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
