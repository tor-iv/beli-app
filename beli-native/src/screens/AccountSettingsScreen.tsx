import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import SettingsRow from '../components/base/SettingsRow';
import { colors, spacing } from '../theme';
import { useUserSettingsStore } from '../store/userSettingsStore';

type Props = NativeStackScreenProps<AppStackParamList, 'AccountSettings'>;

export default function AccountSettingsScreen({ navigation }: Props) {
  const { email, phoneNumber } = useUserSettingsStore();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Manage account',
    });
  }, [navigation]);

  const handleDeactivate = () => {
    Alert.alert(
      'Deactivate Account',
      'Your account will be temporarily deactivated. You can come back whenever you want.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement deactivation logic
            console.log('Deactivating account...');
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement deletion logic
            console.log('Deleting account...');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <SettingsRow
          icon="mail-outline"
          title="Change email"
          value={email}
          type="navigation"
          onPress={() => navigation.navigate('EmailChangeScreen')}
        />
        <SettingsRow
          icon="call-outline"
          title="Change phone number"
          value={phoneNumber}
          type="navigation"
          onPress={() => navigation.navigate('PhoneChangeScreen')}
        />
        <SettingsRow
          icon="lock-closed-outline"
          title="Change password"
          type="navigation"
          onPress={() => navigation.navigate('ChangePasswordScreen')}
        />
        <SettingsRow
          icon="card-outline"
          title="Manage payment methods"
          type="navigation"
          onPress={() => navigation.navigate('PaymentMethodsScreen')}
        />
        <SettingsRow
          icon="school-outline"
          title="Add school"
          type="navigation"
          onPress={() => navigation.navigate('SchoolSelectionScreen')}
        />
        <SettingsRow
          icon="briefcase-outline"
          title="Company settings"
          type="navigation"
          onPress={() => navigation.navigate('CompanySettingsScreen')}
        />
        <SettingsRow
          icon="shield-outline"
          title="Privacy settings"
          type="navigation"
          onPress={() => navigation.navigate('PrivacySettings')}
        />

        {/* Destructive Section */}
        <View style={styles.destructiveSection}>
          <SettingsRow
            icon="pause-circle-outline"
            title="Deactivate my account"
            subtitle="Come back whenever you want"
            type="navigation"
            destructive
            onPress={handleDeactivate}
          />
          <SettingsRow
            icon="trash-outline"
            title="Delete my account"
            subtitle="Permanently delete your account"
            type="navigation"
            destructive
            onPress={handleDelete}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  destructiveSection: {
    marginTop: 40,
  },
});
