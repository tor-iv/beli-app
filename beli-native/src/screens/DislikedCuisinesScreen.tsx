import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '../navigation/types';
import { CheckboxRow } from '../components';
import { colors, spacing, typography } from '../theme';
import { useUserSettingsStore } from '../store/userSettingsStore';

type Props = NativeStackScreenProps<AppStackParamList, 'DislikedCuisinesScreen'>;

const CUISINE_TYPES = [
  'American',
  'Barbecue',
  'British',
  'Chinese',
  'French',
  'Greek',
  'Indian',
  'Italian',
  'Japanese',
  'Korean',
  'Latin American',
  'Mediterranean',
  'Mexican',
  'Middle Eastern',
  'Spanish',
  'Thai',
  'Vietnamese',
];

export default function DislikedCuisinesScreen({ navigation }: Props) {
  const { dislikedCuisines, addDislikedCuisine, removeDislikedCuisine } = useUserSettingsStore();
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(dislikedCuisines);

  useEffect(() => {
    setSelectedCuisines(dislikedCuisines);
  }, [dislikedCuisines]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleToggle = (cuisine: string, checked: boolean) => {
    if (checked) {
      setSelectedCuisines(prev => [...prev, cuisine]);
    } else {
      setSelectedCuisines(prev => prev.filter(c => c !== cuisine));
    }
  };

  const handleSave = () => {
    // Remove old cuisines that are no longer selected
    dislikedCuisines.forEach(cuisine => {
      if (!selectedCuisines.includes(cuisine)) {
        removeDislikedCuisine(cuisine);
      }
    });

    // Add new cuisines
    selectedCuisines.forEach(cuisine => {
      if (!dislikedCuisines.includes(cuisine)) {
        addDislikedCuisine(cuisine);
      }
    });

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={28} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Title and Subtitle */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Your disliked cuisines</Text>
        <Text style={styles.subtitle}>
          Beli won't recommend these types of restaurants to you.
        </Text>
      </View>

      {/* Checkbox List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {CUISINE_TYPES.map((cuisine) => (
          <CheckboxRow
            key={cuisine}
            label={cuisine}
            checked={selectedCuisines.includes(cuisine)}
            onToggle={(checked) => handleToggle(cuisine, checked)}
          />
        ))}
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'System',
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  buttonContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.xl,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.white,
  },
});
