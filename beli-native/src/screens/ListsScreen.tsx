import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../theme';
import { ListCard, LoadingSpinner, TabSelector } from '../components';
import { MockDataService } from '../data/mockDataService';
import type { UserList } from '../data/mock/types';

type ListType = 'all' | 'been' | 'want' | 'recs' | 'custom';

export default function ListsScreen() {
  const [lists, setLists] = useState<UserList[]>([]);
  const [filteredLists, setFilteredLists] = useState<UserList[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<ListType>('all');

  const tabs = [
    { label: 'All', value: 'all' as ListType },
    { label: 'Been', value: 'been' as ListType },
    { label: 'Want to Try', value: 'want' as ListType },
    { label: 'Recs', value: 'recs' as ListType },
    { label: 'Custom', value: 'custom' as ListType },
  ];

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    filterLists(selectedTab);
  }, [selectedTab, lists]);

  const loadLists = async () => {
    try {
      const currentUser = await MockDataService.getCurrentUser();
      const userLists = await MockDataService.getUserLists(currentUser.id);
      setLists(userLists);
      setFilteredLists(userLists);
    } catch (error) {
      console.error('Failed to load lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLists = (type: ListType) => {
    if (type === 'all') {
      setFilteredLists(lists);
      return;
    }

    const typeMap: Record<Exclude<ListType, 'all'>, string> = {
      been: 'been',
      want: 'want_to_try',
      recs: 'recommendations',
      custom: 'custom',
    };

    const filtered = lists.filter(list => list.type === typeMap[type]);
    setFilteredLists(filtered);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TabSelector
          tabs={tabs}
          selectedTab={selectedTab}
          onTabPress={setSelectedTab}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.listsContainer}>
          {filteredLists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              style={styles.listCard}
            />
          ))}
        </View>
      </ScrollView>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  listCard: {
    marginBottom: spacing.md,
  },
});
