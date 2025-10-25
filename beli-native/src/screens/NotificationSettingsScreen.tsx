import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import SettingsRow from '../components/base/SettingsRow';
import { colors } from '../theme';
import { useUserSettingsStore, NotificationPreferences } from '../store/userSettingsStore';

type Props = NativeStackScreenProps<AppStackParamList, 'NotificationSettings'>;

interface NotificationSetting {
  id: keyof NotificationPreferences;
  label: string;
  required?: boolean;
}

const notificationSettings: NotificationSetting[] = [
  { id: 'follows', label: 'Someone follows you' },
  { id: 'bookmarks', label: 'Someone bookmarks from your list' },
  { id: 'likes', label: 'Someone likes one of your ratings or bookmarks' },
  { id: 'comments', label: 'Someone comments on one of your ratings or bookmarks' },
  { id: 'contactJoins', label: 'One of your contacts joins Beli' },
  { id: 'featuredLists', label: 'New featured list' },
  { id: 'restaurantNews', label: 'Restaurant news' },
  {
    id: 'sharedReservations',
    label: 'Shared reservations (this must be enabled to claim reservations)',
    required: true,
  },
  { id: 'weeklyRankReminders', label: 'Weekly rank reminders' },
  { id: 'streakReminders', label: 'Streak reminders' },
  { id: 'orderReminders', label: '"What to order" reminders for reservations made on Beli' },
  { id: 'rankReminders', label: 'Reminder to rank after a reservation made on Beli' },
];

export default function NotificationSettingsScreen({ navigation }: Props) {
  const { notifications, updateNotificationPreference } = useUserSettingsStore();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Notification settings',
    });
  }, [navigation]);

  const handleToggle = (id: keyof NotificationPreferences, value: boolean, required?: boolean) => {
    if (required && !value) {
      Alert.alert(
        'Required Notification',
        'This notification must be enabled to use the reservations feature.',
        [{ text: 'OK' }]
      );
      return;
    }
    updateNotificationPreference(id, value);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {notificationSettings.map((setting) => (
          <SettingsRow
            key={setting.id}
            title={setting.label}
            type="toggle"
            toggleValue={notifications[setting.id]}
            onToggle={(value) => handleToggle(setting.id, value, setting.required)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
});
