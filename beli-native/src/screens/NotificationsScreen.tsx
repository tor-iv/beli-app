import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, typography } from '../theme';
import { NotificationListItem } from '../components/social/NotificationListItem';
import { LoadingSpinner } from '../components';
import { MockDataService } from '../data/mockDataService';
import type { Notification } from '../types';
import type { AppStackParamList } from '../navigation/types';

type NotificationsScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Notifications'>;

export default function NotificationsScreen() {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      const notificationData = await MockDataService.getNotifications();
      setNotifications(notificationData);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    await MockDataService.markNotificationAsRead(notification.id);

    // Navigate based on notification type
    if (notification.type === 'rating_liked' || notification.type === 'bookmark_liked' || notification.type === 'comment' || notification.type === 'list_bookmark') {
      if (notification.targetRestaurant) {
        navigation.navigate('RestaurantInfo', { restaurantId: notification.targetRestaurant.id });
      }
    } else if (notification.type === 'follow') {
      // Navigate to user profile when we implement it
      // navigation.navigate('Profile', { userId: notification.actorUser?.id });
    }
    // Streak notifications don't navigate anywhere
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderHeader = () => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderText}>Earlier</Text>
    </View>
  );

  const renderNotification = ({ item }: { item: Notification }) => (
    <NotificationListItem
      notification={item}
      onPress={() => handleNotificationPress(item)}
    />
  );

  const renderSeparator = () => <View style={styles.separator} />;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.backButton} />
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ItemSeparatorComponent={renderSeparator}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.cardWhite,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    paddingHorizontal: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  sectionHeaderText: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.primary,
  },
  separator: {
    height: 0.5,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.lg,
  },
  listContent: {
    backgroundColor: colors.cardWhite,
  },
});
