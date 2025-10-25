# Settings & Menu System Implementation Plan

## Overview
This document provides a complete implementation guide for the Settings and Menu system in the Beli Native app, based on design mockups. This system includes a hamburger menu, settings hub, and multiple settings screens.

---

## Navigation Flow

```
Any Screen (Feed, Lists, Search, Leaderboard, Profile)
    ↓ (Hamburger icon in header)
Hamburger Menu Modal
    ↓ (Settings item)
Settings Hub Screen
    ├── Your account → Account Settings Screen
    ├── Notifications → Notification Settings Screen
    ├── Privacy → Privacy Settings Screen
    ├── Your app → App Settings Screen
    └── Help → Help/FAQ Screen
```

---

## 1. Hamburger Menu Modal

### Visual Specifications
- **Type**: Full-screen modal overlay
- **Background**: White modal card over dimmed backdrop (rgba(0,0,0,0.5))
- **Width**: 85% of screen width, aligned right
- **Animation**: Slide in from right (300ms, ease-out)
- **Border Radius**: 0 (full-screen height, rounded left edge optional)

### Header
- **Title**: "Menu"
- **Typography**: `typography.heading2`, weight: 600, 24px
- **Close Button**: X icon in circle
  - Position: Top-right
  - Size: 44x44 touchable area
  - Icon: 24x24
  - Color: `colors.gray600`

### Menu Items

Each menu item follows this pattern:
- **Height**: 60px minimum (auto-height for multi-line labels)
- **Padding**: 20px horizontal, 16px vertical
- **Layout**: `flexDirection: 'row'`, `alignItems: 'center'`
- **Icon Size**: 24x24
- **Icon Margin**: 16px right of icon
- **Typography**: System font, 17px, weight: 400
- **Chevron**: Right-aligned, 20x20, `colors.gray400`

#### Menu Item List

1. **Invites Counter** (Info Item)
   - Icon: `mail-outline` (Ionicons)
   - Text: "You have 4 invites left!"
   - Background: `rgba(11, 123, 127, 0.1)` (light teal)
   - No chevron
   - Action: None (informational)

2. **Add Your School**
   - Icon: `school-outline`
   - Text: "Add Your School"
   - Chevron: Yes
   - Action: Opens JoinSchoolModal

3. **Settings** ⭐
   - Icon: `settings-outline`
   - Text: "Settings"
   - Chevron: Yes
   - Action: Navigate to SettingsHubScreen

4. **Your Reservations**
   - Icon: `calendar-outline`
   - Text: "Your Reservations"
   - Chevron: Yes
   - Action: Navigate to ReservationsScreen

5. **Your 2025 Goal**
   - Icon: `trophy-outline`
   - Text: "Your 2025 Goal"
   - Chevron: Yes
   - Action: Navigate to GoalScreen

6. **FAQ**
   - Icon: `chatbubbles-outline`
   - Text: "FAQ"
   - Chevron: Yes
   - Action: Navigate to FAQScreen

7. **Home City** (Display Current)
   - Icon: `business-outline`
   - Text: "Home City: New York, NY"
   - Chevron: Yes
   - Action: Opens ChangeHomeCityModal

8. **Dietary Restrictions**
   - Icon: `warning-outline`
   - Text: "Dietary Restrictions"
   - Chevron: Yes
   - Action: Navigate to DietaryRestrictionsScreen

9. **Disliked Cuisines**
   - Icon: `restaurant-outline` with slash
   - Text: "Disliked Cuisines"
   - Chevron: Yes
   - Action: Navigate to DislikedCuisinesScreen

10. **Import Existing List**
    - Icon: `cloud-upload-outline`
    - Text: "Import Existing List"
    - Chevron: Yes
    - Action: Navigate to ImportListScreen

11. **Change Password**
    - Icon: `lock-closed-outline`
    - Text: "Change Password"
    - Chevron: Yes
    - Action: Navigate to ChangePasswordScreen

12. **Privacy Policy**
    - Icon: `document-text-outline`
    - Text: "Privacy Policy"
    - Chevron: Yes
    - Action: Opens privacy policy (WebView or PDF)

**Section Divider** (16px margin, hairline separator)

13. **Log Out** (Destructive)
    - Icon: `log-out-outline`
    - Text: "Log Out"
    - Text Color: `colors.error` (#DC2626)
    - No chevron
    - Action: Show confirmation alert → Logout

### Implementation Details

```typescript
// File: beli-native/src/components/modals/HamburgerMenu.tsx

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '../../theme';

interface MenuItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel?: string;
  type: 'navigation' | 'action' | 'info';
  action?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  backgroundColor?: string;
}

interface HamburgerMenuProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
  userInvitesRemaining: number;
  userHomeCity: string;
}

export default function HamburgerMenu({
  visible,
  onClose,
  navigation,
  userInvitesRemaining,
  userHomeCity,
}: HamburgerMenuProps) {
  const menuItems: MenuItem[] = [
    {
      id: 'invites',
      icon: 'mail-outline',
      label: `You have ${userInvitesRemaining} invites left!`,
      type: 'info',
      showChevron: false,
      backgroundColor: 'rgba(11, 123, 127, 0.1)',
    },
    {
      id: 'school',
      icon: 'school-outline',
      label: 'Add Your School',
      type: 'action',
      action: () => {
        onClose();
        // Open JoinSchoolModal
      },
      showChevron: true,
    },
    {
      id: 'settings',
      icon: 'settings-outline',
      label: 'Settings',
      type: 'navigation',
      action: () => {
        onClose();
        navigation.navigate('SettingsHub');
      },
      showChevron: true,
    },
    // ... other menu items
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.menuContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Menu</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.gray600} />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <ScrollView style={styles.menuScrollView}>
            {menuItems.map((item) => (
              <MenuItemRow key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    width: '85%',
    height: '100%',
    backgroundColor: colors.background,
    paddingTop: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  headerTitle: {
    ...typography.heading2,
    fontWeight: '600',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuScrollView: {
    flex: 1,
  },
});
```

---

## 2. Settings Hub Screen

### Visual Specifications
- **Type**: Standard screen with navigation header
- **Header**:
  - Back button (chevron-left)
  - Title: "Settings" (centered)
  - Background: `colors.background`
- **Content**: ScrollView with category cards

### Category Cards

Each category is a pressable card:
- **Height**: 88px
- **Margin**: 16px horizontal, 12px vertical
- **Padding**: 16px all around
- **Border Radius**: `spacing.borderRadius.lg` (12px)
- **Shadow**: `shadows.small`
- **Background**: `colors.background` (white)

#### Card Layout
```
[Icon Circle]  [Title          ] [>]
               [Subtitle       ]
```

- **Icon Circle**: 40x40 circle
  - Background: `rgba(11, 123, 127, 0.1)` (10% opacity teal)
  - Icon: 24x24, color: `colors.primary`
- **Text Container**: Flex: 1, marginLeft: 12px
  - **Title**: `typography.body`, weight: 600, 17px, `colors.textPrimary`
  - **Subtitle**: `typography.caption`, 14px, `colors.gray500`
- **Chevron**: 20x20, `colors.gray400`, absolute right

### Settings Categories

1. **Your account**
   - Icon: `people-outline`
   - Title: "Your account"
   - Subtitle: "Change password, update contact info, etc."
   - Navigate to: AccountSettingsScreen

2. **Notifications**
   - Icon: `notifications-outline`
   - Title: "Notifications"
   - Subtitle: "Select which notifications you receive from us"
   - Navigate to: NotificationSettingsScreen

3. **Privacy**
   - Icon: `shield-outline`
   - Title: "Privacy"
   - Subtitle: "Manage the information you see and share on Beli"
   - Navigate to: PrivacySettingsScreen

4. **Your app**
   - Icon: `phone-portrait-outline`
   - Title: "Your app"
   - Subtitle: "Disable vibrations, set distance units"
   - Navigate to: AppSettingsScreen

5. **Help**
   - Icon: `help-circle-outline`
   - Title: "Help"
   - Subtitle: "Read our frequently asked questions and contact support"
   - Navigate to: HelpScreen

**Bottom Section** (after divider)

6. **Logout** (Destructive Action)
   - No card styling
   - Text only: "Logout"
   - Color: `colors.error`
   - Centered
   - Height: 60px touchable area
   - Shows confirmation alert

### Implementation Details

```typescript
// File: beli-native/src/screens/SettingsHubScreen.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '../theme';

interface SettingCategory {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  screen: string;
}

const settingsCategories: SettingCategory[] = [
  {
    id: 'account',
    icon: 'people-outline',
    title: 'Your account',
    subtitle: 'Change password, update contact info, etc.',
    screen: 'AccountSettings',
  },
  {
    id: 'notifications',
    icon: 'notifications-outline',
    title: 'Notifications',
    subtitle: 'Select which notifications you receive from us',
    screen: 'NotificationSettings',
  },
  {
    id: 'privacy',
    icon: 'shield-outline',
    title: 'Privacy',
    subtitle: 'Manage the information you see and share on Beli',
    screen: 'PrivacySettings',
  },
  {
    id: 'app',
    icon: 'phone-portrait-outline',
    title: 'Your app',
    subtitle: 'Disable vibrations, set distance units',
    screen: 'AppSettings',
  },
  {
    id: 'help',
    icon: 'help-circle-outline',
    title: 'Help',
    subtitle: 'Read our frequently asked questions and contact support',
    screen: 'Help',
  },
];

export default function SettingsHubScreen({ navigation }: any) {
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
            // Handle logout
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {settingsCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => navigation.navigate(category.screen)}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Ionicons name={category.icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
          </TouchableOpacity>
        ))}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 88,
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(11, 123, 127, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  categoryTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  categorySubtitle: {
    ...typography.caption,
    color: colors.gray500,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gray200,
    marginVertical: spacing.lg,
  },
  logoutButton: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.error,
  },
});
```

---

## 3. Account Settings Screen

### Visual Specifications
- **Header**: "Manage account"
- **Layout**: ScrollView with setting rows

### Settings Rows

Each row follows this pattern:
- **Height**: 72px (with value shown) or 60px (simple)
- **Padding**: 16px horizontal, 12px vertical
- **Border**: Bottom hairline only (`colors.gray200`)
- **Layout**: Icon + Text Container + Chevron

#### Standard Row Layout
```
[Icon] [Title          ] [>]
       [Value (gray)   ]
```

#### Row Types

1. **Change email**
   - Icon: `mail-outline`
   - Title: "Change email"
   - Value: "vcox484@gmail.com" (gray, 15px)
   - Chevron: Yes
   - Action: Navigate to EmailChangeScreen

2. **Change phone number**
   - Icon: `call-outline`
   - Title: "Change phone number"
   - Value: "+16519559920" (gray)
   - Chevron: Yes
   - Action: Navigate to PhoneChangeScreen

3. **Change password**
   - Icon: `lock-closed-outline`
   - Title: "Change password"
   - No value (security)
   - Chevron: Yes
   - Action: Navigate to ChangePasswordScreen

4. **Manage payment methods**
   - Icon: `card-outline`
   - Title: "Manage payment methods"
   - Chevron: Yes
   - Action: Navigate to PaymentMethodsScreen

5. **Add school**
   - Icon: `school-outline`
   - Title: "Add school"
   - Chevron: Yes
   - Action: Navigate to SchoolSelectionScreen

6. **Company settings**
   - Icon: `briefcase-outline`
   - Title: "Company settings"
   - Chevron: Yes
   - Action: Navigate to CompanySettingsScreen

7. **Privacy settings**
   - Icon: `shield-outline`
   - Title: "Privacy settings"
   - Chevron: Yes
   - Action: Navigate to PrivacySettingsScreen

**Destructive Section** (with extra margin-top: 40px)

8. **Deactivate my account**
   - Title: "Deactivate my account" (`colors.error`)
   - Subtitle: "Come back whenever you want" (gray, 14px)
   - Chevron: Yes
   - Action: Show confirmation → Deactivate

9. **Delete my account**
   - Title: "Delete my account" (`colors.error`)
   - Subtitle: "Permanently delete your account" (gray, 14px)
   - Chevron: Yes
   - Action: Show warning modal → Delete

### Implementation Details

```typescript
// File: beli-native/src/screens/AccountSettingsScreen.tsx

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

interface AccountSettingRow {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value?: string;
  subtitle?: string;
  type: 'standard' | 'destructive';
  screen?: string;
  action?: () => void;
}

export default function AccountSettingsScreen({ navigation }: any) {
  const standardSettings: AccountSettingRow[] = [
    {
      id: 'email',
      icon: 'mail-outline',
      title: 'Change email',
      value: 'vcox484@gmail.com',
      type: 'standard',
      screen: 'EmailChange',
    },
    {
      id: 'phone',
      icon: 'call-outline',
      title: 'Change phone number',
      value: '+16519559920',
      type: 'standard',
      screen: 'PhoneChange',
    },
    {
      id: 'password',
      icon: 'lock-closed-outline',
      title: 'Change password',
      type: 'standard',
      screen: 'ChangePassword',
    },
    {
      id: 'payment',
      icon: 'card-outline',
      title: 'Manage payment methods',
      type: 'standard',
      screen: 'PaymentMethods',
    },
    {
      id: 'school',
      icon: 'school-outline',
      title: 'Add school',
      type: 'standard',
      screen: 'SchoolSelection',
    },
    {
      id: 'company',
      icon: 'briefcase-outline',
      title: 'Company settings',
      type: 'standard',
      screen: 'CompanySettings',
    },
    {
      id: 'privacy',
      icon: 'shield-outline',
      title: 'Privacy settings',
      type: 'standard',
      screen: 'PrivacySettings',
    },
  ];

  const destructiveSettings: AccountSettingRow[] = [
    {
      id: 'deactivate',
      icon: 'pause-circle-outline',
      title: 'Deactivate my account',
      subtitle: 'Come back whenever you want',
      type: 'destructive',
      action: () => {
        // Show deactivation confirmation
      },
    },
    {
      id: 'delete',
      icon: 'trash-outline',
      title: 'Delete my account',
      subtitle: 'Permanently delete your account',
      type: 'destructive',
      action: () => {
        // Show deletion warning
      },
    },
  ];

  const renderSettingRow = (setting: AccountSettingRow) => (
    <TouchableOpacity
      key={setting.id}
      style={styles.settingRow}
      onPress={() => {
        if (setting.screen) {
          navigation.navigate(setting.screen);
        } else if (setting.action) {
          setting.action();
        }
      }}
      activeOpacity={0.7}
    >
      {setting.icon && (
        <Ionicons
          name={setting.icon}
          size={24}
          color={setting.type === 'destructive' ? colors.error : colors.gray600}
        />
      )}
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.settingTitle,
            setting.type === 'destructive' && styles.destructiveText,
          ]}
        >
          {setting.title}
        </Text>
        {setting.value && (
          <Text style={styles.settingValue}>{setting.value}</Text>
        )}
        {setting.subtitle && (
          <Text style={styles.settingSubtitle}>{setting.subtitle}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        {standardSettings.map(renderSettingRow)}

        <View style={styles.destructiveSection}>
          {destructiveSettings.map(renderSettingRow)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  settingTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  settingValue: {
    ...typography.caption,
    color: colors.gray400,
    marginTop: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.gray400,
    marginTop: 4,
  },
  destructiveText: {
    color: colors.error,
  },
  destructiveSection: {
    marginTop: 40,
  },
});
```

---

## 4. App Settings Screen

### Visual Specifications
- **Header**: "App settings"
- **Layout**: Simple list with toggle and selection rows

### Settings

1. **Disable vibrations**
   - Type: Toggle switch
   - Label: "Disable vibrations" (left)
   - Switch: iOS-style (right)
   - Colors: OFF = `colors.gray300`, ON = `colors.primary`
   - Height: 60px

2. **Distance units**
   - Type: Selection row
   - Label: "Distance units" (typography.body, weight: 600)
   - Value: "Miles" (colors.gray400, below label)
   - Chevron: Yes
   - Opens: Action sheet or modal with options:
     - Miles ✓
     - Kilometers

### Implementation Details

```typescript
// File: beli-native/src/screens/AppSettingsScreen.tsx

import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ActionSheetIOS, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

export default function AppSettingsScreen() {
  const [vibrationsDisabled, setVibrationsDisabled] = useState(false);
  const [distanceUnit, setDistanceUnit] = useState<'Miles' | 'Kilometers'>('Miles');

  const handleDistanceUnitPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Miles', 'Kilometers'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) setDistanceUnit('Miles');
          if (buttonIndex === 2) setDistanceUnit('Kilometers');
        }
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Toggle Row */}
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Disable vibrations</Text>
        <Switch
          value={vibrationsDisabled}
          onValueChange={setVibrationsDisabled}
          trackColor={{ false: colors.gray300, true: colors.primary }}
          thumbColor={colors.background}
          ios_backgroundColor={colors.gray300}
        />
      </View>

      {/* Selection Row */}
      <TouchableOpacity
        style={styles.settingRow}
        onPress={handleDistanceUnitPress}
        activeOpacity={0.7}
      >
        <View style={styles.textContainer}>
          <Text style={styles.settingLabel}>Distance units</Text>
          <Text style={styles.settingValue}>{distanceUnit}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    height: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  textContainer: {
    flex: 1,
  },
  settingLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  settingValue: {
    ...typography.caption,
    color: colors.gray400,
    marginTop: 4,
  },
});
```

---

## 5. Notification Settings Screen

### Visual Specifications
- **Header**: "Notification settings"
- **Layout**: ScrollView with toggle switches

### Notification Toggles

All toggles default to ON (green `colors.primary`):

1. Someone follows you
2. Someone bookmarks from your list
3. Someone likes one of your ratings or bookmarks
4. Someone comments on one of your ratings or bookmarks
5. One of your contacts joins Beli
6. New featured list
7. Restaurant news
8. **Shared reservations (this must be enabled to claim reservations)** ⚠️
9. Weekly rank reminders
10. Streak reminders
11. "What to order" reminders for reservations made on Beli
12. Reminder to rank after a reservation made on Beli

### Toggle Row Specifications
- **Height**: 60-80px (auto for multi-line)
- **Padding**: 16px horizontal, 12px vertical
- **Layout**: Label (flex: 1) + Switch (right)
- **Label**: Typography.body, 17px, wraps naturally
- **Border**: Bottom hairline
- **Switch Colors**: OFF = gray, ON = `colors.primary` (teal)

### Implementation Details

```typescript
// File: beli-native/src/screens/NotificationSettingsScreen.tsx

import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface NotificationSetting {
  id: string;
  label: string;
  required?: boolean;
  defaultValue: boolean;
}

const notificationSettings: NotificationSetting[] = [
  { id: 'follows', label: 'Someone follows you', defaultValue: true },
  { id: 'bookmarks', label: 'Someone bookmarks from your list', defaultValue: true },
  { id: 'likes', label: 'Someone likes one of your ratings or bookmarks', defaultValue: true },
  { id: 'comments', label: 'Someone comments on one of your ratings or bookmarks', defaultValue: true },
  { id: 'contactJoins', label: 'One of your contacts joins Beli', defaultValue: true },
  { id: 'featuredList', label: 'New featured list', defaultValue: true },
  { id: 'restaurantNews', label: 'Restaurant news', defaultValue: true },
  {
    id: 'sharedReservations',
    label: 'Shared reservations (this must be enabled to claim reservations)',
    required: true,
    defaultValue: true,
  },
  { id: 'weeklyRank', label: 'Weekly rank reminders', defaultValue: true },
  { id: 'streak', label: 'Streak reminders', defaultValue: true },
  { id: 'orderReminders', label: '"What to order" reminders for reservations made on Beli', defaultValue: true },
  { id: 'rankReminders', label: 'Reminder to rank after a reservation made on Beli', defaultValue: true },
];

export default function NotificationSettingsScreen() {
  const [notificationPrefs, setNotificationPrefs] = useState<Record<string, boolean>>(
    notificationSettings.reduce((acc, setting) => {
      acc[setting.id] = setting.defaultValue;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const handleToggle = (id: string, value: boolean, required?: boolean) => {
    if (required && !value) {
      // Show alert that this is required
      return;
    }
    setNotificationPrefs((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {notificationSettings.map((setting) => (
          <View key={setting.id} style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>{setting.label}</Text>
            <Switch
              value={notificationPrefs[setting.id]}
              onValueChange={(value) => handleToggle(setting.id, value, setting.required)}
              trackColor={{ false: colors.gray300, true: colors.primary }}
              thumbColor={colors.background}
              ios_backgroundColor={colors.gray300}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  toggleLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.md,
  },
});
```

---

## 6. Privacy Settings Screen

### Visual Specifications
- **Header**: "Privacy settings"
- **Layout**: Mixed toggles and navigation rows

### Privacy Controls

1. **Public Account**
   - Type: Toggle switch
   - Label: "Public Account"
   - Default: ON (colors.primary)
   - Description: When OFF, profile is private
   - Height: 60px

2. **Blocked accounts**
   - Type: Navigation row
   - Label: "Blocked accounts"
   - Badge: Count of blocked users (if > 0)
   - Chevron: Yes
   - Opens: BlockedAccountsScreen

3. **Muted accounts**
   - Type: Navigation row
   - Label: "Muted accounts"
   - Badge: Count of muted users (if > 0)
   - Chevron: Yes
   - Opens: MutedAccountsScreen

4. **Manage cookies**
   - Type: Navigation row
   - Label: "Manage cookies"
   - Chevron: Yes
   - Opens: CookiePreferencesScreen

### Implementation Details

```typescript
// File: beli-native/src/screens/PrivacySettingsScreen.tsx

import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

export default function PrivacySettingsScreen({ navigation }: any) {
  const [isPublicAccount, setIsPublicAccount] = useState(true);
  const [blockedCount] = useState(0);
  const [mutedCount] = useState(0);

  return (
    <View style={styles.container}>
      {/* Toggle Row */}
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Public Account</Text>
        <Switch
          value={isPublicAccount}
          onValueChange={setIsPublicAccount}
          trackColor={{ false: colors.gray300, true: colors.primary }}
          thumbColor={colors.background}
          ios_backgroundColor={colors.gray300}
        />
      </View>

      {/* Navigation Rows */}
      <TouchableOpacity
        style={styles.settingRow}
        onPress={() => navigation.navigate('BlockedAccounts')}
        activeOpacity={0.7}
      >
        <Text style={styles.settingLabel}>Blocked accounts</Text>
        {blockedCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{blockedCount}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingRow}
        onPress={() => navigation.navigate('MutedAccounts')}
        activeOpacity={0.7}
      >
        <Text style={styles.settingLabel}>Muted accounts</Text>
        {mutedCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{mutedCount}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingRow}
        onPress={() => navigation.navigate('CookiePreferences')}
        activeOpacity={0.7}
      >
        <Text style={styles.settingLabel}>Manage cookies</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    height: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  settingLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: 8,
  },
  badgeText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
});
```

---

## 7. Change Home City Modal

### Visual Specifications
- **Type**: Bottom sheet modal
- **Height**: Auto (~400px)
- **Background**: White with rounded top corners (20px)
- **Animation**: Slide up from bottom (300ms)
- **Backdrop**: Dimmed background (rgba(0,0,0,0.5))

### Modal Structure

1. **Header**
   - Title: "Change home city"
   - Typography: typography.heading2, 24px, weight: 700
   - Alignment: Center
   - Close Button: X icon (top-right, 44x44)

2. **Search Input**
   - Placeholder: "Search your home city" (italic, gray)
   - Border: Bottom border only (1px)
   - Height: 52px
   - Icon: search-outline (left, 20x20)
   - Padding: 16px horizontal
   - Auto-focus: Yes

3. **City Results** (appears when typing)
   - Dropdown below input
   - Each result: City, State/Country
   - Touchable rows, 48px height
   - Dividers between results

4. **Save Button**
   - Text: "Save"
   - Background: colors.primary (teal)
   - Text Color: White
   - Height: 52px
   - Border Radius: 26px (fully rounded)
   - Width: 90% of modal width
   - Margin: 32px from input
   - Disabled state: colors.gray300 (when no city selected)

### Implementation Details

```typescript
// File: beli-native/src/components/modals/ChangeHomeCityModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Pressable,
  Keyboard,
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
    }
  }, [visible]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      // Debounced search - implement city search here
      // For now, mock results
      setCityResults([
        { id: '1', name: 'New York', state: 'NY', country: 'USA' },
        { id: '2', name: 'New Orleans', state: 'LA', country: 'USA' },
      ]);
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
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Change home city</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.gray600} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color={colors.gray400}
              style={styles.searchIcon}
            />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Search your home city"
              placeholderTextColor={colors.gray400}
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
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing.xl,
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  title: {
    ...typography.heading2,
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    right: spacing.lg,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray300,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    height: 40,
  },
  resultsList: {
    maxHeight: 200,
  },
  resultItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  resultText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    ...shadows.small,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '600',
  },
});
```

---

## 8. Join School Modal

### Visual Specifications
- **Type**: Full-screen modal
- **Background**: White
- **Layout**: Centered vertical alignment

### Modal Content

1. **Illustration**
   - Position: Top-center, 80px from top
   - Size: 300x200px
   - Style: Line art in teal (`colors.primary`)
   - Content: Books (labeled "1", "2") and graduation cap
   - Background: Light gray organic blob shape

2. **Heading**
   - Text: "Join your school's leaderboard"
   - Typography: typography.heading1, 32px, weight: 700
   - Color: colors.textPrimary
   - Alignment: Center
   - Margin: 40px below illustration

3. **Subheading**
   - Text: "See how you shape up against your classmates!"
   - Typography: typography.body, 17px
   - Color: colors.gray500
   - Alignment: Center
   - Margin: 16px below heading

4. **Join Button**
   - Text: "Join"
   - Background: colors.primary
   - Text Color: White, 18px, weight: 600
   - Height: 56px
   - Border Radius: 28px
   - Width: 85% of screen width
   - Shadow: shadows.medium
   - Position: 60px from bottom

5. **Not Now Button**
   - Text: "Not now"
   - Style: Text only (no background)
   - Color: colors.gray500
   - Typography: 17px, weight: 400
   - Height: 44px
   - Position: 20px below Join button

### Implementation Details

```typescript
// File: beli-native/src/components/modals/JoinSchoolModal.tsx

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
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
          {/* Replace with actual SVG or Image */}
          <View style={styles.illustrationPlaceholder}>
            <Text style={styles.illustrationText}>🎓</Text>
            <Text style={styles.illustrationText}>📚</Text>
          </View>
        </View>

        {/* Heading */}
        <Text style={styles.heading}>Join your school's{'\n'}leaderboard</Text>

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
    backgroundColor: colors.background,
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
    backgroundColor: colors.gray100,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationText: {
    fontSize: 60,
  },
  heading: {
    ...typography.heading1,
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 40,
  },
  subheading: {
    ...typography.body,
    fontSize: 17,
    color: colors.gray500,
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
    ...shadows.medium,
  },
  joinButtonText: {
    color: colors.background,
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
    color: colors.gray500,
    fontSize: 17,
    fontWeight: '400',
  },
});
```

---

## Navigation Integration

### Update Navigation Types

```typescript
// File: beli-native/src/navigation/types.tsx

export type RootStackParamList = {
  // ... existing screens

  // Settings Screens
  SettingsHub: undefined;
  AccountSettings: undefined;
  AppSettings: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  HelpScreen: undefined;

  // Feature Screens
  ReservationsScreen: undefined;
  GoalScreen: undefined;
  FAQScreen: undefined;
  DietaryRestrictionsScreen: undefined;
  DislikedCuisinesScreen: undefined;
  ImportListScreen: undefined;
  ChangePasswordScreen: undefined;
  PrivacyPolicyScreen: undefined;

  // Sub-screens
  EmailChangeScreen: undefined;
  PhoneChangeScreen: undefined;
  PaymentMethodsScreen: undefined;
  SchoolSelectionScreen: undefined;
  CompanySettingsScreen: undefined;
  BlockedAccountsScreen: undefined;
  MutedAccountsScreen: undefined;
  CookiePreferencesScreen: undefined;
};
```

### Add Hamburger Menu to Headers

Update all main tab screens (Feed, Lists, Search, Leaderboard, Profile):

```typescript
// Example: beli-native/src/screens/FeedScreen.tsx

import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HamburgerMenu from '../components/modals/HamburgerMenu';
import { colors } from '../theme';

export default function FeedScreen({ navigation }: any) {
  const [menuVisible, setMenuVisible] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={{ paddingRight: 16 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <>
      {/* Existing feed content */}

      <HamburgerMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
        userInvitesRemaining={4}
        userHomeCity="New York, NY"
      />
    </>
  );
}
```

---

## State Management (Zustand Store)

### User Settings Store

```typescript
// File: beli-native/src/store/userSettingsStore.ts

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationPreferences {
  follows: boolean;
  bookmarks: boolean;
  likes: boolean;
  comments: boolean;
  contactJoins: boolean;
  featuredLists: boolean;
  restaurantNews: boolean;
  sharedReservations: boolean;
  weeklyRankReminders: boolean;
  streakReminders: boolean;
  orderReminders: boolean;
  rankReminders: boolean;
}

interface CookiePreferences {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface UserSettings {
  // Account
  email: string;
  phoneNumber: string;
  school?: string;
  company?: string;
  homeCity: string;

  // App Settings
  vibrationsDisabled: boolean;
  distanceUnit: 'Miles' | 'Kilometers';

  // Notification Preferences
  notifications: NotificationPreferences;

  // Privacy Settings
  isPublicAccount: boolean;
  blockedUsers: string[];
  mutedUsers: string[];
  cookiePreferences: CookiePreferences;

  // Preferences
  dietaryRestrictions: string[];
  dislikedCuisines: string[];

  // Feature Flags
  hasJoinedSchool: boolean;
  hasSetGoal: boolean;
  invitesRemaining: number;
}

interface UserSettingsStore extends UserSettings {
  // Actions
  updateEmail: (email: string) => void;
  updatePhoneNumber: (phone: string) => void;
  updateHomeCity: (city: string) => void;
  updateVibrationsDisabled: (disabled: boolean) => void;
  updateDistanceUnit: (unit: 'Miles' | 'Kilometers') => void;
  updateNotificationPreference: (key: keyof NotificationPreferences, value: boolean) => void;
  updatePublicAccount: (isPublic: boolean) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  muteUser: (userId: string) => void;
  unmuteUser: (userId: string) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

export const useUserSettingsStore = create<UserSettingsStore>((set, get) => ({
  // Initial State
  email: '',
  phoneNumber: '',
  homeCity: '',
  vibrationsDisabled: false,
  distanceUnit: 'Miles',
  notifications: {
    follows: true,
    bookmarks: true,
    likes: true,
    comments: true,
    contactJoins: true,
    featuredLists: true,
    restaurantNews: true,
    sharedReservations: true,
    weeklyRankReminders: true,
    streakReminders: true,
    orderReminders: true,
    rankReminders: true,
  },
  isPublicAccount: true,
  blockedUsers: [],
  mutedUsers: [],
  cookiePreferences: {
    analytics: true,
    marketing: false,
    functional: true,
  },
  dietaryRestrictions: [],
  dislikedCuisines: [],
  hasJoinedSchool: false,
  hasSetGoal: false,
  invitesRemaining: 4,

  // Actions
  updateEmail: (email) => {
    set({ email });
    get().saveSettings();
  },

  updatePhoneNumber: (phoneNumber) => {
    set({ phoneNumber });
    get().saveSettings();
  },

  updateHomeCity: (homeCity) => {
    set({ homeCity });
    get().saveSettings();
  },

  updateVibrationsDisabled: (vibrationsDisabled) => {
    set({ vibrationsDisabled });
    get().saveSettings();
  },

  updateDistanceUnit: (distanceUnit) => {
    set({ distanceUnit });
    get().saveSettings();
  },

  updateNotificationPreference: (key, value) => {
    set((state) => ({
      notifications: {
        ...state.notifications,
        [key]: value,
      },
    }));
    get().saveSettings();
  },

  updatePublicAccount: (isPublicAccount) => {
    set({ isPublicAccount });
    get().saveSettings();
  },

  blockUser: (userId) => {
    set((state) => ({
      blockedUsers: [...state.blockedUsers, userId],
    }));
    get().saveSettings();
  },

  unblockUser: (userId) => {
    set((state) => ({
      blockedUsers: state.blockedUsers.filter((id) => id !== userId),
    }));
    get().saveSettings();
  },

  muteUser: (userId) => {
    set((state) => ({
      mutedUsers: [...state.mutedUsers, userId],
    }));
    get().saveSettings();
  },

  unmuteUser: (userId) => {
    set((state) => ({
      mutedUsers: state.mutedUsers.filter((id) => id !== userId),
    }));
    get().saveSettings();
  },

  loadSettings: async () => {
    try {
      const settingsJson = await AsyncStorage.getItem('userSettings');
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        set(settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },

  saveSettings: async () => {
    try {
      const state = get();
      const settingsToSave = {
        email: state.email,
        phoneNumber: state.phoneNumber,
        homeCity: state.homeCity,
        vibrationsDisabled: state.vibrationsDisabled,
        distanceUnit: state.distanceUnit,
        notifications: state.notifications,
        isPublicAccount: state.isPublicAccount,
        blockedUsers: state.blockedUsers,
        mutedUsers: state.mutedUsers,
        cookiePreferences: state.cookiePreferences,
        dietaryRestrictions: state.dietaryRestrictions,
        dislikedCuisines: state.dislikedCuisines,
        hasJoinedSchool: state.hasJoinedSchool,
        hasSetGoal: state.hasSetGoal,
        invitesRemaining: state.invitesRemaining,
      };
      await AsyncStorage.setItem('userSettings', JSON.stringify(settingsToSave));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },
}));
```

---

## MockDataService Updates

Add settings-related methods:

```typescript
// File: beli-native/src/data/mockDataService.ts

// Add to MockDataService class:

static async updateUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<void> {
  await this.delay(150);
  // In production, sync with backend
  console.log('Updated user settings:', settings);
}

static async getUserSettings(userId: string): Promise<UserSettings> {
  await this.delay(150);
  // Return user settings from backend
  return {
    email: 'vcox484@gmail.com',
    phoneNumber: '+16519559920',
    homeCity: 'New York, NY',
    // ... rest of settings
  };
}

static async searchCities(query: string): Promise<City[]> {
  await this.delay(300);
  // In production, use Google Places API or city database
  const mockCities = [
    { id: '1', name: 'New York', state: 'NY', country: 'USA' },
    { id: '2', name: 'Los Angeles', state: 'CA', country: 'USA' },
    { id: '3', name: 'Chicago', state: 'IL', country: 'USA' },
    // ... more cities
  ];
  return mockCities.filter((city) =>
    city.name.toLowerCase().includes(query.toLowerCase())
  );
}

static async searchSchools(query: string): Promise<School[]> {
  await this.delay(300);
  const mockSchools = [
    { id: '1', name: 'Columbia University', location: 'New York, NY' },
    { id: '2', name: 'NYU', location: 'New York, NY' },
    // ... more schools
  ];
  return mockSchools.filter((school) =>
    school.name.toLowerCase().includes(query.toLowerCase())
  );
}
```

---

## Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Create base SettingsRow component
- [ ] Create base SettingsCard component
- [ ] Create base BottomSheetModal component
- [ ] Set up userSettingsStore with Zustand
- [ ] Add new screen types to navigation

### Phase 2: Hamburger Menu (Week 1)
- [ ] Create HamburgerMenu modal component
- [ ] Add menu icon to all tab screen headers
- [ ] Wire up all menu items to navigation
- [ ] Test menu open/close animations

### Phase 3: Settings Hub & Screens (Week 2)
- [ ] Create SettingsHubScreen with category cards
- [ ] Create AccountSettingsScreen with all rows
- [ ] Create AppSettingsScreen with toggle and picker
- [ ] Create NotificationSettingsScreen with 12 toggles
- [ ] Create PrivacySettingsScreen with mixed controls
- [ ] Register all screens in RootNavigator

### Phase 4: Modals (Week 2)
- [ ] Create ChangeHomeCityModal with search
- [ ] Implement city search with debounce
- [ ] Create JoinSchoolModal with illustration
- [ ] Create school selection flow
- [ ] Test all modal animations

### Phase 5: Additional Screens (Week 3)
- [ ] Create placeholder screens for:
  - [ ] ReservationsScreen
  - [ ] GoalScreen
  - [ ] FAQScreen
  - [ ] DietaryRestrictionsScreen
  - [ ] DislikedCuisinesScreen
  - [ ] HelpScreen

### Phase 6: Sub-flows (Week 3)
- [ ] Email change screen with verification
- [ ] Phone change screen with verification
- [ ] Password change screen with validation
- [ ] Payment methods screen (for reservations)
- [ ] Blocked/muted users list screens
- [ ] Cookie preferences screen

### Phase 7: Integration & Testing (Week 4)
- [ ] Connect all settings to Zustand store
- [ ] Implement AsyncStorage persistence
- [ ] Add confirmation alerts for destructive actions
- [ ] Test all navigation flows
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test on iOS and Android
- [ ] Verify accessibility (screen readers, touch targets)

---

## Design Specifications Summary

### Typography
- **Headers**: typography.heading2 (24px, weight: 600)
- **Titles**: typography.body (17px, weight: 600)
- **Labels**: typography.body (17px, weight: 400)
- **Values**: typography.caption (15px, colors.gray400)
- **Subtitles**: 14px, colors.gray500

### Colors
- **Primary**: colors.primary (#0B7B7F - teal)
- **Error**: colors.error (#DC2626 - red)
- **Background**: colors.background (white)
- **Text**: colors.textPrimary (black)
- **Secondary Text**: colors.gray400, colors.gray500
- **Borders**: colors.gray200, colors.gray300
- **Toggle ON**: colors.primary (teal)
- **Toggle OFF**: colors.gray300

### Spacing
- **Padding Standard**: spacing.lg (16px)
- **Padding Large**: spacing.xl (24px)
- **Margins**: spacing.md (12px), spacing.lg (16px)
- **Border Radius Cards**: spacing.borderRadius.lg (12px)
- **Border Radius Buttons**: Half of height (fully rounded)

### Shadows
- **Cards**: shadows.small
- **Buttons**: shadows.medium
- **Modals**: shadows.large

### Touch Targets
- **Minimum Size**: 44x44 (iOS HIG standard)
- **Row Height**: 60-88px depending on content
- **Hit Slop**: { top: 10, bottom: 10, left: 10, right: 10 }

### Animations
- **Modal Enter**: 300ms, ease-out
- **Modal Exit**: 250ms, ease-in
- **Slide In**: translateX from 100% to 0
- **Slide Up**: translateY from 100% to 0
- **Backdrop Fade**: opacity from 0 to 0.5

---

## Testing Checklist

### Visual Testing
- [ ] All screens match design mockups
- [ ] Icons are correct size and color
- [ ] Typography is consistent
- [ ] Spacing is uniform
- [ ] Shadows render correctly
- [ ] Colors match design system

### Functional Testing
- [ ] Navigation works from all entry points
- [ ] Back buttons return to correct screens
- [ ] Modals dismiss correctly
- [ ] Toggles save state
- [ ] Search debounces properly
- [ ] Settings persist after app restart
- [ ] Alerts show for destructive actions

### Accessibility Testing
- [ ] Screen reader labels work
- [ ] Touch targets are 44x44 minimum
- [ ] Color contrast meets WCAG standards
- [ ] Focus order is logical
- [ ] Text scales with system font size

### Performance Testing
- [ ] No lag when opening modals
- [ ] Smooth animations (60fps)
- [ ] Fast AsyncStorage reads/writes
- [ ] No memory leaks
- [ ] Search doesn't block UI

---

## Notes

- All screens use the existing Beli design system (colors, typography, spacing, shadows)
- Icons use Ionicons (included with Expo)
- Animations use React Native Animated API
- State persists with AsyncStorage
- Settings sync with backend (to be implemented)
- All touchable areas meet iOS HIG 44x44 minimum
- Supports iPhone SE (small screen) to iPhone Pro Max (large screen)
- Portrait orientation only
- Light mode only (no dark mode)

---

## Dependencies

Already included in project:
- @react-navigation/native
- @react-navigation/native-stack
- @react-navigation/bottom-tabs
- @expo/vector-icons (Ionicons)
- react-native-safe-area-context
- zustand

May need to add:
- @react-native-async-storage/async-storage (for settings persistence)

---

This implementation plan provides all the details needed to build the complete Settings and Menu system for the Beli Native app, matching the design mockups pixel-perfectly while maintaining consistency with the existing codebase.
