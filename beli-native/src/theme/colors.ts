export const colors = {
  // Primary brand colors
  primary: '#0A6C70',        // Main teal brand color (slightly richer)
  primaryDark: '#075159',    // Darker variant for CTAs
  primaryLight: '#E6F7FF',   // Light variant for backgrounds
  white: '#FFFFFF',          // Pure white
  offWhite: '#FAFAFA',       // Secondary background

  // Rating system colors
  ratingExcellent: '#22C55E', // 8.5+ ratings - Bright green
  ratingGood: '#84CC16',      // 7.0-8.4 ratings - Light green
  ratingAverage: '#F59E0B',   // 5.0-6.9 ratings - Amber/Yellow
  ratingPoor: '#EF4444',      // Below 5.0 - Red

  // Semantic colors
  success: '#00A676',
  error: '#FF4D4F',
  warning: '#FAAD14',
  info: '#1890FF',

  // Background colors
  background: '#FAFAFA',     // Main app background
  cardBackground: '#FFFFFF', // Card backgrounds
  cardWhite: '#FFFFFF',      // Card white (alias for consistency)
  modalBackground: '#FFFFFF',

  // Text colors
  textPrimary: '#000000',    // Main text - pure black
  textSecondary: '#8E8E93',  // Secondary info - iOS gray
  textTertiary: '#C7C7CC',   // Disabled/placeholder
  textInverse: '#FFFFFF',    // White text on dark backgrounds

  // Border colors
  borderLight: '#E5E5EA',    // Subtle borders
  borderMedium: '#C7C7CC',   // Stronger borders

  // Shadow and overlay
  shadow: 'rgba(0,0,0,0.08)',     // Card shadows
  overlay: 'rgba(0,0,0,0.5)',     // Modal backgrounds
  shimmer: 'rgba(255,255,255,0.8)', // Loading shimmer

  // Interactive states
  activeBackground: 'rgba(11,123,127,0.1)', // Active/pressed state
  hoverBackground: 'rgba(11,123,127,0.05)', // Hover state

  // Special colors
  streak: '#FF6B35',         // Streak flame color
  online: '#4CAF50',         // Online status indicator
  verified: '#1890FF',       // Verification badge
} as const;

export type ColorKey = keyof typeof colors;
