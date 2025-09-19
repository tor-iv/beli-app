export const spacing = {
  // Basic spacing scale
  xs: 4,    // Tight spacing
  sm: 8,    // Small spacing
  md: 12,   // Medium spacing
  lg: 16,   // Large spacing - standard edge padding
  xl: 24,   // Extra large - section spacing
  '2xl': 32, // Major section spacing
  '3xl': 48, // Large section breaks
  '4xl': 64, // Major layout spacing

  // Component-specific spacing
  cardPadding: 16,        // Standard card internal padding
  cardMargin: 12,         // Space between cards
  edgePadding: 16,        // Screen edge padding
  sectionSpacing: 24,     // Between major sections
  listItemSpacing: 12,    // Between list items
  buttonSpacing: 8,       // Between buttons
  iconSpacing: 8,         // Icon to text spacing

  // Interactive element sizing
  touchTarget: 44,        // Minimum touch target size
  buttonHeight: 44,       // Standard button height
  inputHeight: 44,        // Standard input height
  tabBarHeight: 83,       // Bottom tab bar height (with safe area)
  headerHeight: 44,       // Navigation header height

  // Border radius values
  borderRadius: {
    xs: 4,   // Small elements
    sm: 8,   // Standard elements
    md: 12,  // Cards and larger elements
    lg: 16,  // Large cards
    xl: 24,  // Buttons (pill shape)
    full: 999, // Circular elements
  },
} as const;

export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof spacing.borderRadius;
