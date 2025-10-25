import React from 'react';
import { View, StyleSheet, ActionSheetIOS, Platform, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import SettingsRow from '../components/base/SettingsRow';
import { colors } from '../theme';
import { useUserSettingsStore } from '../store/userSettingsStore';

type Props = NativeStackScreenProps<AppStackParamList, 'AppSettings'>;

export default function AppSettingsScreen({ navigation }: Props) {
  const {
    vibrationsDisabled,
    distanceUnit,
    updateVibrationsDisabled,
    updateDistanceUnit,
  } = useUserSettingsStore();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'App settings',
    });
  }, [navigation]);

  const handleDistanceUnitPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Miles', 'Kilometers'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) updateDistanceUnit('Miles');
          if (buttonIndex === 2) updateDistanceUnit('Kilometers');
        }
      );
    } else {
      Alert.alert(
        'Distance units',
        'Select your preferred distance unit',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Miles', onPress: () => updateDistanceUnit('Miles') },
          { text: 'Kilometers', onPress: () => updateDistanceUnit('Kilometers') },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <SettingsRow
        title="Disable vibrations"
        type="toggle"
        toggleValue={vibrationsDisabled}
        onToggle={updateVibrationsDisabled}
      />
      <SettingsRow
        title="Distance units"
        value={distanceUnit}
        type="navigation"
        onPress={handleDistanceUnitPress}
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
