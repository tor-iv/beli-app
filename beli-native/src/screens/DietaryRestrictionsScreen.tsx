import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '../navigation/types';
import { CheckboxRow } from '../components';
import { colors, spacing, typography } from '../theme';
import { useUserSettingsStore } from '../store/userSettingsStore';

type Props = NativeStackScreenProps<AppStackParamList, 'DietaryRestrictionsScreen'>;

const DIETARY_OPTIONS = [
  'Dairy Allergy',
  'Gluten Free',
  'Halal',
  'Kosher',
  'Lactose Intolerant',
  'No Beef',
  'No Pork',
  'No Red Meat',
  'Nut Allergy',
  'Paleo',
  'Peanut Allergy',
  'Pescatarian',
  'Vegan',
  'Vegetarian',
  'Shellfish Allergy',
  'Soy Allergy',
];

export default function DietaryRestrictionsScreen({ navigation }: Props) {
  const { dietaryRestrictions, addDietaryRestriction, removeDietaryRestriction } = useUserSettingsStore();
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(dietaryRestrictions);

  useEffect(() => {
    setSelectedRestrictions(dietaryRestrictions);
  }, [dietaryRestrictions]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleToggle = (restriction: string, checked: boolean) => {
    if (checked) {
      setSelectedRestrictions(prev => [...prev, restriction]);
    } else {
      setSelectedRestrictions(prev => prev.filter(r => r !== restriction));
    }
  };

  const handleSave = () => {
    // Remove old restrictions that are no longer selected
    dietaryRestrictions.forEach(restriction => {
      if (!selectedRestrictions.includes(restriction)) {
        removeDietaryRestriction(restriction);
      }
    });

    // Add new restrictions
    selectedRestrictions.forEach(restriction => {
      if (!dietaryRestrictions.includes(restriction)) {
        addDietaryRestriction(restriction);
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

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Your dietary restrictions</Text>
      </View>

      {/* Checkbox List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {DIETARY_OPTIONS.map((option) => (
          <CheckboxRow
            key={option}
            label={option}
            checked={selectedRestrictions.includes(option)}
            onToggle={(checked) => handleToggle(option, checked)}
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
