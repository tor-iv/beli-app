import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Restaurant, OrderSuggestion, HungerLevel } from '../../types';
import { colors, spacing, typography, shadows } from '../../theme';
import { Button } from '../base';
import { MockDataService } from '../../data/mockDataService';

interface WhatToOrderModalProps {
  visible: boolean;
  restaurant: Restaurant;
  onClose: () => void;
}

type Step = 'setup' | 'suggestions';

const HUNGER_LEVELS: Array<{
  value: HungerLevel;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  color: string;
}> = [
  {
    value: 'light',
    icon: 'leaf-outline',
    label: 'Light Bites',
    description: 'Just a taste',
    color: '#34C759',
  },
  {
    value: 'moderate',
    icon: 'restaurant-outline',
    label: 'Moderately Hungry',
    description: 'Regular meal',
    color: '#FF9500',
  },
  {
    value: 'very-hungry',
    icon: 'flame-outline',
    label: 'Very Hungry',
    description: 'Bring it all',
    color: '#FF3B30',
  },
];

export default function WhatToOrderModal({
  visible,
  restaurant,
  onClose,
}: WhatToOrderModalProps) {
  const [step, setStep] = useState<Step>('setup');
  const [partySize, setPartySize] = useState(2);
  const [hungerLevel, setHungerLevel] = useState<HungerLevel>('moderate');
  const [suggestion, setSuggestion] = useState<OrderSuggestion | null>(null);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const shuffleRotation = useRef(new Animated.Value(0)).current;

  const handleClose = () => {
    // Reset state when closing
    setStep('setup');
    setPartySize(2);
    setHungerLevel('moderate');
    setSuggestion(null);
    onClose();
  };

  const handleGenerateSuggestions = async () => {
    setLoading(true);
    try {
      const result = await MockDataService.generateOrderSuggestion(
        restaurant.id,
        partySize,
        hungerLevel
      );
      setSuggestion(result);
      setStep('suggestions');
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      // Show error state or fallback
    } finally {
      setLoading(false);
    }
  };

  const handleShuffle = async () => {
    // Animate shuffle
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(shuffleRotation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(shuffleRotation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Generate new suggestion
    try {
      const result = await MockDataService.generateOrderSuggestion(
        restaurant.id,
        partySize,
        hungerLevel
      );
      setSuggestion(result);
    } catch (error) {
      console.error('Failed to shuffle suggestions:', error);
    }
  };

  const handleShare = async () => {
    if (!suggestion) return;

    try {
      const itemsList = suggestion.items
        .map(item => `${item.quantity}× ${item.name} - $${item.price * item.quantity}`)
        .join('\n');

      const message = `Order for ${restaurant.name}\nParty of ${suggestion.partySize} • ${suggestion.hungerLevel.replace('-', ' ')}\n\n${itemsList}\n\nTotal: $${suggestion.totalPrice.toFixed(2)}\n\n${suggestion.estimatedSharability}\n\nSuggested by beli 🍽️`;

      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderSetupStep = () => (
    <>
      <View style={styles.setupContent}>
        {/* Party Size Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How many people?</Text>
          <View style={styles.partySizeContainer}>
            <TouchableOpacity
              style={[
                styles.partySizeButton,
                partySize === 1 && styles.partySizeButtonDisabled,
              ]}
              onPress={() => setPartySize(Math.max(1, partySize - 1))}
              disabled={partySize === 1}
            >
              <Ionicons
                name="remove"
                size={24}
                color={partySize === 1 ? colors.textTertiary : colors.primary}
              />
            </TouchableOpacity>

            <View style={styles.partySizeDisplay}>
              <Text style={styles.partySizeNumber}>{partySize}</Text>
              <Text style={styles.partySizeLabel}>
                {partySize === 1 ? 'person' : 'people'}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.partySizeButton,
                partySize === 12 && styles.partySizeButtonDisabled,
              ]}
              onPress={() => setPartySize(Math.min(12, partySize + 1))}
              disabled={partySize === 12}
            >
              <Ionicons
                name="add"
                size={24}
                color={partySize === 12 ? colors.textTertiary : colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hunger Level Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How hungry are you?</Text>
          <View style={styles.hungerLevelsContainer}>
            {HUNGER_LEVELS.map(level => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.hungerLevelCard,
                  hungerLevel === level.value && styles.hungerLevelCardSelected,
                  hungerLevel === level.value && {
                    borderColor: level.color,
                    backgroundColor: `${level.color}10`,
                  },
                ]}
                onPress={() => setHungerLevel(level.value)}
              >
                <View style={styles.hungerLevelCardContent}>
                  <View
                    style={[
                      styles.hungerIconContainer,
                      hungerLevel === level.value && { backgroundColor: level.color },
                    ]}
                  >
                    <Ionicons
                      name={level.icon}
                      size={32}
                      color={hungerLevel === level.value ? colors.textInverse : level.color}
                    />
                  </View>
                  <View style={styles.hungerLevelTextContainer}>
                    <Text
                      style={[
                        styles.hungerLevelLabel,
                        hungerLevel === level.value && styles.hungerLevelLabelSelected,
                      ]}
                    >
                      {level.label}
                    </Text>
                    <Text
                      style={[
                        styles.hungerLevelDescription,
                        hungerLevel === level.value && styles.hungerLevelDescriptionSelected,
                      ]}
                    >
                      {level.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={loading ? 'Generating...' : 'Get Suggestions'}
          onPress={handleGenerateSuggestions}
          disabled={loading}
          style={styles.primaryButton}
        />
      </View>
    </>
  );

  const renderSuggestionsStep = () => {
    if (!suggestion) return null;

    const spin = shuffleRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <>
        <ScrollView
          style={styles.suggestionsScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.summaryPrice}>
                  ${suggestion.totalPrice.toFixed(2)}
                </Text>
                <Text style={styles.summaryPricePerPerson}>
                  ${(suggestion.totalPrice / suggestion.partySize).toFixed(2)} per person
                </Text>
              </View>
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.summaryDescription}>
              {suggestion.estimatedSharability}
            </Text>

            {/* Reasoning Chips */}
            <View style={styles.reasoningContainer}>
              {suggestion.reasoning.map((reason, index) => (
                <View key={index} style={styles.reasoningChip}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={styles.reasoningText}>{reason}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Menu Items */}
          <Animated.View style={[styles.menuItemsContainer, { opacity: fadeAnim }]}>
            {suggestion.items.map((item, index) => (
              <View key={`${item.id}-${index}`} style={styles.menuItemCard}>
                <Image source={{ uri: item.imageUrl }} style={styles.menuItemImage} />
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemHeader}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    {item.quantity > 1 && (
                      <View style={styles.quantityBadge}>
                        <Text style={styles.quantityText}>×{item.quantity}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.menuItemDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.menuItemFooter}>
                    <Text style={styles.menuItemPrice}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                    <View style={styles.menuItemMeta}>
                      <View style={styles.portionSizeBadge}>
                        <Text style={styles.portionSizeText}>
                          {item.portionSize === 'shareable' ? '🍽️ Shareable' :
                           item.portionSize === 'large' ? 'Large' :
                           item.portionSize === 'medium' ? 'Medium' : 'Small'}
                        </Text>
                      </View>
                      {item.isVegetarian && (
                        <View style={styles.dietaryBadge}>
                          <Text style={styles.dietaryText}>🌱</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </Animated.View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Floating Shuffle Button */}
        <TouchableOpacity style={styles.shuffleButton} onPress={handleShuffle}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="shuffle" size={24} color={colors.textInverse} />
          </Animated.View>
        </TouchableOpacity>

        {/* Footer Button */}
        <View style={styles.footer}>
          <Button
            title="Looks Good!"
            onPress={handleClose}
            style={styles.primaryButton}
          />
        </View>
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={step === 'suggestions' ? () => setStep('setup') : handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={step === 'suggestions' ? 'chevron-back' : 'close'}
              size={28}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 'setup' ? 'What Should We Order?' : 'Your Order'}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {step === 'setup' ? renderSetupStep() : renderSuggestionsStep()}

        {loading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Creating your perfect order...</Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    ...typography.textStyles.h3,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  setupContent: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    ...typography.textStyles.h3,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  partySizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  partySizeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cardWhite,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    ...shadows.button,
  },
  partySizeButtonDisabled: {
    borderColor: colors.borderLight,
    backgroundColor: colors.offWhite,
  },
  partySizeDisplay: {
    alignItems: 'center',
    minWidth: 100,
  },
  partySizeNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 56,
  },
  partySizeLabel: {
    ...typography.textStyles.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  hungerLevelsContainer: {
    gap: spacing.md,
  },
  hungerLevelCard: {
    backgroundColor: colors.cardWhite,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  hungerLevelCardSelected: {
    borderWidth: 2,
  },
  hungerLevelCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  hungerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  hungerLevelTextContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  hungerLevelLabel: {
    ...typography.textStyles.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  hungerLevelLabelSelected: {
    fontWeight: '700',
  },
  hungerLevelDescription: {
    ...typography.textStyles.caption,
    fontSize: 14,
    color: colors.textSecondary,
  },
  hungerLevelDescriptionSelected: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  suggestionsScroll: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: colors.cardWhite,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: spacing.borderRadius.lg,
    ...shadows.card,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  summaryPrice: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 42,
  },
  summaryPricePerPerson: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(11, 123, 127, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryDescription: {
    ...typography.textStyles.body,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  reasoningContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  reasoningChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.md,
  },
  reasoningText: {
    ...typography.textStyles.caption,
    color: colors.success,
    fontWeight: '500',
  },
  menuItemsContainer: {
    paddingHorizontal: spacing.lg,
  },
  menuItemCard: {
    backgroundColor: colors.cardWhite,
    borderRadius: spacing.borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  menuItemImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.offWhite,
  },
  menuItemContent: {
    padding: spacing.md,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  menuItemName: {
    ...typography.textStyles.h3,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  quantityBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: spacing.borderRadius.sm,
    marginLeft: spacing.sm,
  },
  quantityText: {
    ...typography.textStyles.caption,
    color: colors.textInverse,
    fontWeight: '700',
  },
  menuItemDescription: {
    ...typography.textStyles.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemPrice: {
    ...typography.textStyles.body,
    fontWeight: '700',
    color: colors.primary,
    fontSize: 18,
  },
  menuItemMeta: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  portionSizeBadge: {
    backgroundColor: colors.offWhite,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: spacing.borderRadius.sm,
  },
  portionSizeText: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  dietaryBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: spacing.borderRadius.sm,
  },
  dietaryText: {
    fontSize: 11,
  },
  shuffleButton: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 100,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.modal,
  },
  bottomSpacer: {
    height: 100,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: colors.cardWhite,
    padding: spacing.xl,
    borderRadius: spacing.borderRadius.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.textStyles.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});
