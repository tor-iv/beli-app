import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'PrivacyPolicyScreen'>;

export default function PrivacyPolicyScreen({ navigation }: Props) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Privacy Policy',
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updated}>Last Updated: October 2025</Text>

        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.body}>
          We collect information you provide directly to us when you create an account, add restaurants to your lists, write reviews, and interact with other users. This includes your name, email address, profile information, restaurant ratings, reviews, photos, and your dining preferences.
        </Text>

        <Text style={styles.heading}>2. How We Use Your Information</Text>
        <Text style={styles.body}>
          We use the information we collect to provide, maintain, and improve our services, including to:
          {'\n\n'}• Personalize your restaurant recommendations
          {'\n'}• Connect you with friends and other users
          {'\n'}• Send you notifications about activity on your account
          {'\n'}• Analyze usage patterns to improve our platform
          {'\n'}• Facilitate reservation sharing among users
        </Text>

        <Text style={styles.heading}>3. Information Sharing</Text>
        <Text style={styles.body}>
          Your restaurant reviews, ratings, and lists are visible to other Beli users unless you make your account private. We do not sell your personal information to third parties. We may share your information with service providers who assist us in operating the platform.
        </Text>

        <Text style={styles.heading}>4. Data Retention</Text>
        <Text style={styles.body}>
          We retain your account information for as long as your account is active or as needed to provide you services. You can request deletion of your account at any time through the Account Settings page.
        </Text>

        <Text style={styles.heading}>5. Your Privacy Controls</Text>
        <Text style={styles.body}>
          You can control your privacy settings in the app, including:
          {'\n\n'}• Making your account public or private
          {'\n'}• Managing notification preferences
          {'\n'}• Blocking or muting other users
          {'\n'}• Controlling cookie preferences
        </Text>

        <Text style={styles.heading}>6. Security</Text>
        <Text style={styles.body}>
          We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the internet is 100% secure.
        </Text>

        <Text style={styles.heading}>7. Children's Privacy</Text>
        <Text style={styles.body}>
          Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13.
        </Text>

        <Text style={styles.heading}>8. Changes to This Policy</Text>
        <Text style={styles.body}>
          We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
        </Text>

        <Text style={styles.heading}>9. Contact Us</Text>
        <Text style={styles.body}>
          If you have questions about this privacy policy, please contact us at:
          {'\n\n'}privacy@beli.com
        </Text>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    padding: spacing.lg,
  },
  updated: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    fontStyle: 'italic',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  body: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  spacer: {
    height: spacing['2xl'],
  },
});
