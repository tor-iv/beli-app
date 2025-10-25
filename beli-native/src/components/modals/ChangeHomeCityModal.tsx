import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '../../theme';

interface City {
  id: string;
  name: string;
  state: string;
  country: string;
}

interface ChangeHomeCityModalProps {
  visible: boolean;
  currentCity: string;
  onClose: () => void;
  onSave: (city: string) => void;
}

// Mock cities data - in production, use API
const mockCities: City[] = [
  { id: '1', name: 'New York', state: 'NY', country: 'USA' },
  { id: '2', name: 'Los Angeles', state: 'CA', country: 'USA' },
  { id: '3', name: 'Chicago', state: 'IL', country: 'USA' },
  { id: '4', name: 'Houston', state: 'TX', country: 'USA' },
  { id: '5', name: 'Phoenix', state: 'AZ', country: 'USA' },
  { id: '6', name: 'Philadelphia', state: 'PA', country: 'USA' },
  { id: '7', name: 'San Antonio', state: 'TX', country: 'USA' },
  { id: '8', name: 'San Diego', state: 'CA', country: 'USA' },
  { id: '9', name: 'Dallas', state: 'TX', country: 'USA' },
  { id: '10', name: 'San Jose', state: 'CA', country: 'USA' },
];

export default function ChangeHomeCityModal({
  visible,
  currentCity,
  onClose,
  onSave,
}: ChangeHomeCityModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cityResults, setCityResults] = useState<City[]>([]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setSearchQuery('');
      setSelectedCity('');
      setCityResults([]);
    }
  }, [visible]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      // Debounced search
      const timer = setTimeout(() => {
        const filtered = mockCities.filter((city) =>
          city.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setCityResults(filtered);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setCityResults([]);
    }
  }, [searchQuery]);

  const handleCitySelect = (city: City) => {
    const cityString = `${city.name}, ${city.state}`;
    setSelectedCity(cityString);
    setSearchQuery(cityString);
    setCityResults([]);
    Keyboard.dismiss();
  };

  const handleSave = () => {
    if (selectedCity) {
      onSave(selectedCity);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.centeredView}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.title}>Change home city</Text>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                placeholder="Search your home city"
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* City Results */}
            {cityResults.length > 0 && (
              <FlatList
                data={cityResults}
                keyExtractor={(item) => item.id}
                style={styles.resultsList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => handleCitySelect(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resultText}>
                      {item.name}, {item.state}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                !selectedCity && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!selectedCity}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.cardWhite,
    borderRadius: 16,
    paddingVertical: spacing.xl + spacing.lg,
    paddingHorizontal: spacing.xl + spacing.md,
    width: '100%',
    maxWidth: 600,
    ...shadows.cardElevated,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.lg,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'left',
    marginBottom: spacing.xl,
    paddingRight: spacing.xl + spacing.lg, // Make room for close button
  },
  searchContainer: {
    marginBottom: spacing.xl + spacing.md,
  },
  searchInput: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.textPrimary,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.textPrimary,
  },
  resultsList: {
    maxHeight: 200,
    marginBottom: spacing.md,
  },
  resultItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  resultText: {
    ...typography.textStyles.body,
    color: colors.textPrimary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    ...shadows.card,
  },
  saveButtonDisabled: {
    backgroundColor: colors.borderMedium,
  },
  saveButtonText: {
    color: colors.cardWhite,
    fontSize: 18,
    fontWeight: '600',
  },
});
