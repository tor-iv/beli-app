import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface RowProps {
  children: React.ReactNode;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: boolean;
  gap?: number;
  style?: ViewStyle;
  testID?: string;
}

export const Row: React.FC<RowProps> = ({
  children,
  align = 'center',
  justify = 'flex-start',
  wrap = false,
  gap = 0,
  style,
  testID,
}) => {
  const rowStyle = [
    styles.row,
    {
      alignItems: align,
      justifyContent: justify,
      flexWrap: wrap ? 'wrap' : 'nowrap',
      gap,
    },
    style,
  ];

  return (
    <View style={rowStyle} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});