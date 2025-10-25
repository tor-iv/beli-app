import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import SettingsCard from '../components/base/SettingsCard';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'SettingsHub'>;

interface SettingCategory {
  id: string;
  icon: 'people-outline' | 'notifications-outline' | 'shield-outline' | 'phone-portrait-outline' | 'help-circle-outline';
  title: string;
  subtitle: string;
  screen: keyof AppStackParamList;
}

const settingsCategories: SettingCategory[] = [
  {
    id: 'account',
    icon: 'people-outline',
    title: 'Your account',
    subtitle: 'Change password, update contact info, etc.',
    screen: 'AccountSettings',
  },
  {
    id: 'notifications',
    icon: 'notifications-outline',
    title: 'Notifications',
    subtitle: 'Select which notifications you receive from us',
    screen: 'NotificationSettings',
  },
  {
    id: 'privacy',
    icon: 'shield-outline',
    title: 'Privacy',
    subtitle: 'Manage the information you see and share on Beli',
    screen: 'PrivacySettings',
  },
  {
    id: 'app',
    icon: 'phone-portrait-outline',
    title: 'Your app',
    subtitle: 'Disable vibrations, set distance units',
    screen: 'AppSettings',
  },
  {
    id: 'help',
    icon: 'help-circle-outline',
    title: 'Help',
    subtitle: 'Read our frequently asked questions and contact support',
    screen: 'HelpScreen',
  },
];

export default function SettingsHubScreen({ navigation }: Props) {
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement logout logic
            console.log('Logging out...');
          },
        },
      ]
    );
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Settings',
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {settingsCategories.map((category) => (
          <SettingsCard
            key={category.id}
            icon={category.icon}
            title={category.title}
            subtitle={category.subtitle}
            onPress={() => navigation.navigate(category.screen as any)}
          />
        ))}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  scrollContent: {
    padding: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.lg,
  },
  logoutButton: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    ...typography.textStyles.body,
    fontWeight: '600',
    color: colors.error,
  },
});
