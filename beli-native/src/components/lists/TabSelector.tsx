import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView, Text, Pressable } from 'react-native';
import { theme } from '../../theme';

interface TabOption {
  id: string;
  label: string;
  count?: number;
}

interface TabSelectorProps {
  tabs: TabOption[];
  selectedTab: string;
  onTabPress: (tabId: string) => void;
  scrollable?: boolean;
  showCounts?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const TabSelector: React.FC<TabSelectorProps> = ({
  tabs,
  selectedTab,
  onTabPress,
  scrollable = false,
  showCounts = false,
  style,
  testID,
}) => {
  const renderTab = (tab: TabOption) => {
    const isSelected = selectedTab === tab.id;
    const label = showCounts && tab.count !== undefined
      ? `${tab.label} (${tab.count})`
      : tab.label;

    return (
      <View key={tab.id} style={styles.tabContainer}>
        <Pressable
          onPress={() => onTabPress(tab.id)}
          style={styles.tabButton}
        >
          <Text style={[
            styles.tabText,
            isSelected && styles.selectedTabText,
          ]}>
            {label}
          </Text>
        </Pressable>
        {isSelected && <View style={styles.tabUnderline} />}
      </View>
    );
  };

  if (scrollable) {
    return (
      <View style={[styles.container, style]} testID={testID}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {tabs.map(renderTab)}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.fixedContainer, style]} testID={testID}>
      {tabs.map(renderTab)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },

  fixedContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: theme.spacing.edgePadding,
  },

  scrollContent: {
    paddingHorizontal: theme.spacing.edgePadding,
  },

  tabContainer: {
    marginRight: theme.spacing.lg,
    alignItems: 'center',
  },

  tabButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: 0,
  },

  tabText: {
    fontSize: 15,
    color: theme.colors.textTertiary,
    fontWeight: theme.typography.weights.medium,
    letterSpacing: 0.2,
  },

  selectedTabText: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold,
  },

  tabUnderline: {
    height: 3,
    backgroundColor: theme.colors.textPrimary,
    borderRadius: 1.5,
    width: '100%',
    marginTop: theme.spacing.xs,
  },
});
