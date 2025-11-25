import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme';
import { AppStackParamList } from '../../navigation/types';
import { useUserSettingsStore } from '../../store/userSettingsStore';
import ChangeHomeCityModal from './ChangeHomeCityModal';
import JoinSchoolModal from './JoinSchoolModal';

interface MenuItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel?: string;
  type: 'navigation' | 'action' | 'info';
  screen?: keyof AppStackParamList;
  action?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  backgroundColor?: string;
}

interface HamburgerMenuProps {
  visible: boolean;
  onClose: () => void;
  // Accept any navigation object that can navigate to AppStackParamList screens
  // This allows both stack and composite (tab+stack) navigation props
  navigation: { navigate: (screen: keyof AppStackParamList, params?: unknown) => void };
}

export default function HamburgerMenu({
  visible,
  onClose,
  navigation,
}: HamburgerMenuProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const { invitesRemaining, homeCity, updateHomeCity, updateSchool } = useUserSettingsStore();
  const [showChangeHomeCityModal, setShowChangeHomeCityModal] = useState(false);
  const [showJoinSchoolModal, setShowJoinSchoolModal] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            onClose();
            // TODO: Implement logout logic
            console.log('Logging out...');
          },
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: 'invites',
      icon: 'mail-outline',
      label: `You have ${invitesRemaining} invites left!`,
      type: 'info',
      showChevron: false,
      backgroundColor: 'rgba(10, 108, 112, 0.1)',
    },
    {
      id: 'school',
      icon: 'school-outline',
      label: 'Add Your School',
      type: 'action',
      action: () => {
        setShowJoinSchoolModal(true);
      },
      showChevron: true,
    },
    {
      id: 'settings',
      icon: 'settings-outline',
      label: 'Settings',
      type: 'navigation',
      screen: 'SettingsHub',
      showChevron: true,
    },
    {
      id: 'reservations',
      icon: 'calendar-outline',
      label: 'Your Reservations',
      type: 'navigation',
      screen: 'ReservationsScreen',
      showChevron: true,
    },
    {
      id: 'goal',
      icon: 'trophy-outline',
      label: 'Your 2025 Goal',
      type: 'navigation',
      screen: 'GoalScreen',
      showChevron: true,
    },
    {
      id: 'faq',
      icon: 'chatbubbles-outline',
      label: 'FAQ',
      type: 'navigation',
      screen: 'FAQScreen',
      showChevron: true,
    },
    {
      id: 'homeCity',
      icon: 'business-outline',
      label: 'Home City',
      sublabel: homeCity,
      type: 'action',
      action: () => {
        setShowChangeHomeCityModal(true);
      },
      showChevron: true,
    },
    {
      id: 'dietary',
      icon: 'warning-outline',
      label: 'Dietary Restrictions',
      type: 'navigation',
      screen: 'DietaryRestrictionsScreen',
      showChevron: true,
    },
    {
      id: 'disliked',
      icon: 'restaurant-outline',
      label: 'Disliked Cuisines',
      type: 'navigation',
      screen: 'DislikedCuisinesScreen',
      showChevron: true,
    },
    {
      id: 'import',
      icon: 'cloud-upload-outline',
      label: 'Import Existing List',
      type: 'navigation',
      screen: 'ImportListScreen',
      showChevron: true,
    },
    {
      id: 'password',
      icon: 'lock-closed-outline',
      label: 'Change Password',
      type: 'navigation',
      screen: 'ChangePasswordScreen',
      showChevron: true,
    },
    {
      id: 'privacy',
      icon: 'document-text-outline',
      label: 'Privacy Policy',
      type: 'navigation',
      screen: 'PrivacyPolicyScreen',
      showChevron: true,
    },
  ];

  const handleItemPress = (item: MenuItem) => {
    if (item.type === 'navigation' && item.screen) {
      onClose();
      setTimeout(() => {
        navigation.navigate(item.screen as any);
      }, 300);
    } else if (item.action) {
      item.action();
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.type === 'info') {
      return (
        <View
          key={item.id}
          style={[
            styles.menuItem,
            item.backgroundColor && { backgroundColor: item.backgroundColor },
          ]}
        >
          <Ionicons name={item.icon} size={24} color={colors.primary} />
          <View style={styles.menuItemTextContainer}>
            <Text style={[styles.menuItemText, styles.menuItemTextInfo]}>
              {item.label}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.menuItem}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={item.icon}
          size={24}
          color={item.destructive ? colors.error : colors.textSecondary}
        />
        <View style={styles.menuItemTextContainer}>
          <Text
            style={[
              styles.menuItemText,
              item.destructive && styles.menuItemTextDestructive,
            ]}
          >
            {item.label}
          </Text>
          {item.sublabel && (
            <Text style={styles.menuItemSublabel}>{item.sublabel}</Text>
          )}
        </View>
        {item.showChevron && (
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: opacityAnim,
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.menuContainer,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Menu</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <ScrollView style={styles.scrollView}>
            {menuItems.map(renderMenuItem)}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Log Out */}
            <TouchableOpacity
              style={styles.logoutItem}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={24} color={colors.error} />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>

      {/* Change Home City Modal */}
      <ChangeHomeCityModal
        visible={showChangeHomeCityModal}
        currentCity={homeCity}
        onClose={() => setShowChangeHomeCityModal(false)}
        onSave={(city) => updateHomeCity(city)}
      />

      {/* Join School Modal */}
      <JoinSchoolModal
        visible={showJoinSchoolModal}
        onJoin={() => {
          // TODO: Implement school selection flow
          setShowJoinSchoolModal(false);
          console.log('Join school - needs implementation');
        }}
        onDismiss={() => setShowJoinSchoolModal(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  menuContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '85%',
    backgroundColor: colors.cardWhite,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xl + 40, // Extra padding for status bar
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 60,
  },
  menuItemTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  menuItemText: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  menuItemTextInfo: {
    fontWeight: '600',
    color: colors.primary,
  },
  menuItemTextDestructive: {
    color: colors.error,
  },
  menuItemSublabel: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 60,
  },
  logoutText: {
    ...typography.textStyles.body,
    color: colors.error,
    marginLeft: spacing.md,
  },
});
