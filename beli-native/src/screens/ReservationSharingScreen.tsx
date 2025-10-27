import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, typography } from '../theme';
import { MockDataService } from '../data/mockDataService';
import type { Reservation, ReservationPriorityLevel } from '../types';
import type { AppStackParamList } from '../navigation/types';
import ReservationCard from '../components/reservation/ReservationCard';
import PriorityLevelCard from '../components/reservation/PriorityLevelCard';
import ShareReservationModal from '../components/modals/ShareReservationModal';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';

type TabType = 'available' | 'claimed' | 'shared' | 'reminders';

type NavigationProp = StackNavigationProp<AppStackParamList, 'ReservationSharing'>;

export default function ReservationSharingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>('available');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [priorityLevel, setPriorityLevel] = useState<ReservationPriorityLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      const currentUser = await MockDataService.getCurrentUser();
      const priority = await MockDataService.getUserReservationPriority(currentUser.id);
      setPriorityLevel(priority);

      let reservationData: Reservation[] = [];

      switch (activeTab) {
        case 'available':
          reservationData = await MockDataService.getAvailableReservations();
          break;
        case 'claimed':
          reservationData = await MockDataService.getClaimedReservations(currentUser.id);
          break;
        case 'shared':
          reservationData = await MockDataService.getSharedReservations(currentUser.id);
          break;
        case 'reminders':
          reservationData = await MockDataService.getReservationReminders(currentUser.id);
          break;
      }

      setReservations(reservationData);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleClaimReservation = async (reservationId: string) => {
    Alert.alert(
      'Claim Reservation',
      'Are you sure you want to claim this reservation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Claim',
          onPress: async () => {
            try {
              const currentUser = await MockDataService.getCurrentUser();
              const success = await MockDataService.claimReservation(reservationId, currentUser.id);

              if (success) {
                Alert.alert('Success!', 'You have claimed this reservation.');
                loadData();
              } else {
                Alert.alert('Error', 'This reservation is no longer available.');
              }
            } catch (error) {
              console.error('Failed to claim reservation:', error);
              Alert.alert('Error', 'Failed to claim reservation. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleViewReservation = (reservationId: string) => {
    const reservation = reservations.find(r => r.id === reservationId);
    if (reservation) {
      navigation.navigate('RestaurantInfo', { restaurantId: reservation.restaurantId });
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    Alert.alert(
      'Cancel Sharing',
      'Are you sure you want to stop sharing this reservation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await MockDataService.cancelReservationShare(reservationId);

              if (success) {
                Alert.alert('Success', 'Reservation sharing has been cancelled.');
                loadData();
              } else {
                Alert.alert('Error', 'Failed to cancel reservation.');
              }
            } catch (error) {
              console.error('Failed to cancel reservation:', error);
              Alert.alert('Error', 'Failed to cancel reservation. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleShareReservation = (selectedFriendIds: string[]) => {
    setShowShareModal(false);
    Alert.alert(
      'Success!',
      `Reservation shared with ${selectedFriendIds.length} friend${selectedFriendIds.length !== 1 ? 's' : ''}.`
    );
  };

  const handleInfoPress = () => {
    Alert.alert(
      'Priority Levels',
      'SC (Supper Club): Unlimited access to all features\n\n' +
      'Gold: 10+ invites/shares - Premium priority\n\n' +
      'Silver: 5-9 invites/shares - Good priority\n\n' +
      'Bronze: 1-4 invites/shares - Standard priority\n\n' +
      'Invite friends or share reservations to increase your level!',
      [{ text: 'Got it' }]
    );
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <Pressable
        style={[styles.tab, activeTab === 'available' && styles.tabActive]}
        onPress={() => setActiveTab('available')}
      >
        <Text style={[styles.tabText, activeTab === 'available' && styles.tabTextActive]}>
          Available
        </Text>
      </Pressable>
      <Pressable
        style={[styles.tab, activeTab === 'claimed' && styles.tabActive]}
        onPress={() => setActiveTab('claimed')}
      >
        <Text style={[styles.tabText, activeTab === 'claimed' && styles.tabTextActive]}>
          Claimed
        </Text>
      </Pressable>
      <Pressable
        style={[styles.tab, activeTab === 'shared' && styles.tabActive]}
        onPress={() => setActiveTab('shared')}
      >
        <Text style={[styles.tabText, activeTab === 'shared' && styles.tabTextActive]}>
          Shared
        </Text>
      </Pressable>
      <Pressable
        style={[styles.tab, activeTab === 'reminders' && styles.tabActive]}
        onPress={() => setActiveTab('reminders')}
      >
        <Text style={[styles.tabText, activeTab === 'reminders' && styles.tabTextActive]}>
          Reminders
        </Text>
      </Pressable>
    </View>
  );

  const renderHeader = () => (
    <View>
      {renderTabBar()}
      {priorityLevel && activeTab === 'available' && (
        <PriorityLevelCard
          priorityLevel={priorityLevel}
          onSendInvite={() => Alert.alert('Coming Soon', 'Invite functionality will be added soon.')}
          onShareReservation={() => setShowShareModal(true)}
          onInfoPress={handleInfoPress}
        />
      )}
      {activeTab === 'available' && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available to claim</Text>
          <Text style={styles.sectionSubtitle}>
            These are reservations other Beli members have shared
          </Text>
        </View>
      )}
    </View>
  );

  const renderReservationItem = ({ item }: { item: Reservation }) => (
    <View style={styles.cardContainer}>
      <ReservationCard
        reservation={item}
        onClaim={activeTab === 'available' ? handleClaimReservation : undefined}
        onView={activeTab !== 'available' ? handleViewReservation : undefined}
        onCancel={activeTab === 'shared' ? handleCancelReservation : undefined}
        showClaimButton={activeTab === 'available'}
        showViewButton={activeTab !== 'available'}
        showCancelButton={activeTab === 'shared'}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name={activeTab === 'available' ? 'calendar-outline' : activeTab === 'claimed' ? 'checkmark-circle-outline' : activeTab === 'shared' ? 'share-outline' : 'notifications-outline'}
        size={64}
        color={colors.textTertiary}
      />
      <Text style={styles.emptyTitle}>
        {activeTab === 'available' && 'No available reservations'}
        {activeTab === 'claimed' && 'No claimed reservations'}
        {activeTab === 'shared' && 'No shared reservations'}
        {activeTab === 'reminders' && 'No upcoming reminders'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'available' && 'Check back later for new shared reservations'}
        {activeTab === 'claimed' && 'Claim a reservation to see it here'}
        {activeTab === 'shared' && 'Share a reservation with friends to see it here'}
        {activeTab === 'reminders' && 'Your upcoming reservations will appear here'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Reservation Sharing</Text>
          <View style={styles.headerRight}>
            <Pressable onPress={handleInfoPress} style={styles.iconButton}>
              <Ionicons name="information-circle-outline" size={24} color={colors.textPrimary} />
            </Pressable>
            <Pressable onPress={() => Alert.alert('Coming Soon', 'Add reservation functionality will be added soon.')} style={styles.iconButton}>
              <Ionicons name="add" size={28} color={colors.textPrimary} />
            </Pressable>
          </View>
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
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Reservation Sharing</Text>
        <View style={styles.headerRight}>
          <Pressable onPress={handleInfoPress} style={styles.iconButton}>
            <Ionicons name="information-circle-outline" size={24} color={colors.textPrimary} />
          </Pressable>
          <Pressable onPress={() => Alert.alert('Coming Soon', 'Add reservation functionality will be added soon.')} style={styles.iconButton}>
            <Ionicons name="add" size={28} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={reservations}
        renderItem={renderReservationItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[styles.listContent, reservations.length === 0 && styles.listContentEmpty]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />

      <ShareReservationModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        onSubmit={handleShareReservation}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.cardWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    padding: spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.cardWhite,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardContainer: {
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl * 3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
