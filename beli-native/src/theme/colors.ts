export const colors = {
  // Primary colors
  primary: '#0B7B7F',
  primaryDark: '#005F46',
  
  // Success and ratings
  success: '#00A676',
  ratingExcellent: '#00A676', // 8.0+ ratings
  ratingGood: '#52C41A',      // 7.0-7.9 ratings
  ratingAverage: '#FAAD14',   // 5.0-6.9 ratings
  ratingPoor: '#FF4D4F',      // Below 5.0
  
  // Background colors
  background: '#FAFAFA',
  cardWhite: '#FFFFFF',
  offWhite: '#FAFAFA',
  
  // Text colors
  textPrimary: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  
  // UI colors
  borderLight: '#E5E5EA',
  borderMedium: '#C7C7CC',
  shadow: 'rgba(0,0,0,0.08)',
  overlay: 'rgba(0,0,0,0.5)',
  
  // Additional colors
  error: '#FF4D4F',
  warning: '#FAAD14',
  info: '#1890FF',
} as const;

export type ColorKey = keyof typeof colors;
