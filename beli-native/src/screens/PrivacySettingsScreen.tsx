import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import SettingsRow from '../components/base/SettingsRow';
import { colors } from '../theme';
import { useUserSettingsStore } from '../store/userSettingsStore';

type Props = NativeStackScreenProps<AppStackParamList, 'PrivacySettings'>;

export default function PrivacySettingsScreen({ navigation }: Props) {
  const {
    isPublicAccount,
    blockedUsers,
    mutedUsers,
    updatePublicAccount,
  } = useUserSettingsStore();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Privacy settings',
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <SettingsRow
        title="Public Account"
        type="toggle"
        toggleValue={isPublicAccount}
        onToggle={updatePublicAccount}
      />
      <SettingsRow
        title="Blocked accounts"
        type="navigation"
        badge={blockedUsers.length}
        onPress={() => navigation.navigate('BlockedAccountsScreen')}
      />
      <SettingsRow
        title="Muted accounts"
        type="navigation"
        badge={mutedUsers.length}
        onPress={() => navigation.navigate('MutedAccountsScreen')}
      />
      <SettingsRow
        title="Manage cookies"
        type="navigation"
        onPress={() => navigation.navigate('CookiePreferencesScreen')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
});
