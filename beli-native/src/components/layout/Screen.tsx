import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  backgroundColor?: string;
  safeArea?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  testID?: string;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  backgroundColor = theme.colors.background,
  safeArea = true,
  edges = ['top', 'bottom'],
  contentContainerStyle,
  style,
  testID,
}) => {
  const screenStyle = [
    styles.screen,
    { backgroundColor },
    style,
  ];

  const content = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, contentContainerStyle]}>
      {children}
    </View>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      {safeArea ? (
        <SafeAreaView style={screenStyle} edges={edges} testID={testID}>
          {content}
        </SafeAreaView>
      ) : (
        <View style={screenStyle} testID={testID}>
          {content}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  content: {
    flex: 1,
  },
});