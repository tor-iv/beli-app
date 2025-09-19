import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView } from 'react-native';
import { Chip } from '../base';
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
      <Chip
        key={tab.id}
        label={label}
        selected={isSelected}
        onPress={() => onTabPress(tab.id)}
        variant="default"
        size="medium"
        style={[
          styles.tab,
          isSelected && styles.selectedTab,
        ]}
        textStyle={[
          isSelected && styles.selectedTabText,
        ]}
      />
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
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.edgePadding,
  },

  scrollContent: {
    paddingHorizontal: theme.spacing.edgePadding,
  },

  tab: {
    marginRight: theme.spacing.sm,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },

  selectedTab: {
    backgroundColor: theme.colors.primary,
  },

  selectedTabText: {
    color: theme.colors.textInverse,
  },
});