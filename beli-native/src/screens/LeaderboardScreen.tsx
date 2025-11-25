import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../theme';
import { Avatar } from '../components';
import { useLeaderboard } from '../lib/hooks';
import type { User } from '../data/mock/types';
import type { AppStackNavigationProp } from '../navigation/types';

type TabType = 'Been' | 'Influence' | 'Notes' | 'Photos';

interface LeaderboardUser extends User {
  rank: number;
  matchPercentage: number;
  score: number;
}

export default function LeaderboardScreen() {
  const navigation = useNavigation<AppStackNavigationProp>();

  // UI state (kept as useState)
  const [selectedTab, setSelectedTab] = useState<TabType>('Been');
  const [memberFilter, setMemberFilter] = useState('All Members');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Data fetching with React Query hook
  const { data: rawUsers = [], isLoading, refetch, isRefetching } = useLeaderboard();

  // Transform and sort data based on selected tab (using useMemo for performance)
  const allUsers = useMemo((): LeaderboardUser[] => {
    if (!rawUsers.length) return [];

    // Sort based on selected tab
    let sortedUsers = [...rawUsers];
    switch (selectedTab) {
      case 'Been':
        sortedUsers.sort((a, b) => b.stats.beenCount - a.stats.beenCount);
        break;
      case 'Influence':
        sortedUsers.sort((a, b) => b.stats.followers - a.stats.followers);
        break;
      case 'Notes':
        sortedUsers.sort((a, b) => (b.stats.totalReviews || 0) - (a.stats.totalReviews || 0));
        break;
      case 'Photos':
        sortedUsers.sort((a, b) => b.stats.beenCount - a.stats.beenCount);
        break;
    }

    return sortedUsers.map((user, index) => {
      let score = 0;
      switch (selectedTab) {
        case 'Been':
          score = user.stats.beenCount;
          break;
        case 'Influence':
          score = user.stats.followers;
          break;
        case 'Notes':
          score = user.stats.totalReviews || 0;
          break;
        case 'Photos':
          score = user.stats.beenCount;
          break;
      }

      return {
        ...user,
        rank: index + 1,
        matchPercentage: Math.floor(Math.random() * 30) + 30, // 30-60%
        score,
      };
    });
  }, [rawUsers, selectedTab]);

  // Apply filters (using useMemo for performance)
  const users = useMemo((): LeaderboardUser[] => {
    let filtered = [...allUsers];

    // Apply city filter
    if (cityFilter !== 'All Cities') {
      filtered = filtered.filter(user => user.location.city === cityFilter);
    }

    // Apply member filter (could filter by following status, etc.)
    if (memberFilter === 'Friends') {
      // You could filter based on following list
      // filtered = filtered.filter(user => currentUser.following.includes(user.id));
    }

    // Re-rank after filtering
    return filtered.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  }, [allUsers, memberFilter, cityFilter]);

  const getUniqueCities = () => {
    const cities = new Set(allUsers.map(user => user.location.city));
    return ['All Cities', ...Array.from(cities)];
  };

  const getMemberOptions = () => {
    return ['All Members', 'Friends', 'Following'];
  };

  const getSubtitleText = () => {
    switch (selectedTab) {
      case 'Been':
        return 'Number of places on your been list';
      case 'Influence':
        return 'Number of followers';
      case 'Notes':
        return 'Number of reviews written';
      case 'Photos':
        return 'Number of photos uploaded';
      default:
        return '';
    }
  };

  const renderUserItem = ({ item }: { item: LeaderboardUser }) => {
    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
        activeOpacity={0.7}
      >
        <Text style={styles.rank}>{item.rank}</Text>

        <Avatar
          source={{ uri: item.avatar }}
          size="small"
        />

        <View style={styles.userInfo}>
          <Text style={styles.username}>@{item.username}</Text>
          <Text style={styles.matchText}>+{item.matchPercentage}% Match</Text>
        </View>

        <Text style={styles.score}>{item.score}</Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          {(['Been', 'Influence', 'Notes', 'Photos'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                selectedTab === tab && styles.tabActive,
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[
                styles.tabText,
                selectedTab === tab && styles.tabTextActive,
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>{getSubtitleText()}</Text>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowMemberDropdown(!showMemberDropdown)}
            >
              <Text style={styles.filterText}>{memberFilter}</Text>
              <Text style={styles.filterArrow}>▼</Text>
            </TouchableOpacity>
            {showMemberDropdown && (
              <View style={styles.dropdown}>
                {getMemberOptions().map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setMemberFilter(option);
                      setShowMemberDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownText,
                      option === memberFilter && styles.dropdownTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowCityDropdown(!showCityDropdown)}
            >
              <Text style={styles.filterText}>{cityFilter}</Text>
              <Text style={styles.filterArrow}>▼</Text>
            </TouchableOpacity>
            {showCityDropdown && (
              <View style={styles.dropdown}>
                {getUniqueCities().map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCityFilter(city);
                      setShowCityDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownText,
                      city === cityFilter && styles.dropdownTextSelected
                    ]}>
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Leaderboard List */}
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.borderLight,
    borderRadius: 8,
    padding: 2.5,
    marginTop: 6,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.white,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 17,
    borderWidth: 1.3,
    borderColor: colors.textPrimary,
    backgroundColor: colors.white,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 5,
  },
  filterArrow: {
    fontSize: 8,
    color: colors.textPrimary,
  },
  dropdown: {
    position: 'absolute',
    top: 36,
    left: 0,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderLight,
  },
  dropdownText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  dropdownTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderLight,
  },
  rank: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    width: 24,
    marginRight: 6,
  },
  userInfo: {
    flex: 1,
    marginLeft: 8,
  },
  username: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: 1,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#22C55E',
  },
  score: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
