import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, spacing, typography, shadows } from '../../theme';

interface JoinSchoolModalProps {
  visible: boolean;
  onJoin: () => void;
  onDismiss: () => void;
}

export default function JoinSchoolModal({
  visible,
  onJoin,
  onDismiss,
}: JoinSchoolModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          {/* Using emoji as placeholder - replace with actual SVG/Image */}
          <View style={styles.illustrationPlaceholder}>
            <Text style={styles.emoji}>🎓</Text>
            <Text style={styles.emoji}>📚</Text>
          </View>
        </View>

        {/* Heading */}
        <Text style={styles.heading}>
          Join your school's{'\n'}leaderboard
        </Text>

        {/* Subheading */}
        <Text style={styles.subheading}>
          See how you shape up against your{'\n'}classmates!
        </Text>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Join Button */}
        <TouchableOpacity
          style={styles.joinButton}
          onPress={onJoin}
          activeOpacity={0.8}
        >
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>

        {/* Not Now Button */}
        <TouchableOpacity
          style={styles.notNowButton}
          onPress={onDismiss}
          activeOpacity={0.7}
        >
          <Text style={styles.notNowButtonText}>Not now</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cardWhite,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  illustrationContainer: {
    marginTop: 80,
    width: 300,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: colors.borderLight,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  emoji: {
    fontSize: 60,
    marginHorizontal: 10,
  },
  heading: {
    ...typography.textStyles.h1,
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 40,
  },
  subheading: {
    ...typography.textStyles.body,
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  spacer: {
    flex: 1,
  },
  joinButton: {
    backgroundColor: colors.primary,
    width: '85%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...shadows.cardElevated,
  },
  joinButtonText: {
    color: colors.cardWhite,
    fontSize: 18,
    fontWeight: '600',
  },
  notNowButton: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  notNowButtonText: {
    color: colors.textSecondary,
    fontSize: 17,
    fontWeight: '400',
  },
});
