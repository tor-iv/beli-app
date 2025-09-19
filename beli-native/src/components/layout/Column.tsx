import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface ColumnProps {
  children: React.ReactNode;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  gap?: number;
  style?: ViewStyle;
  testID?: string;
}

export const Column: React.FC<ColumnProps> = ({
  children,
  align = 'stretch',
  justify = 'flex-start',
  gap = 0,
  style,
  testID,
}) => {
  const columnStyle = [
    styles.column,
    {
      alignItems: align,
      justifyContent: justify,
      gap,
    },
    style,
  ];

  return (
    <View style={columnStyle} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    flexDirection: 'column',
  },
});