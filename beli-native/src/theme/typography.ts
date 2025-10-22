export const typography = {
  fontFamily: {
    primary: 'System', // Use system font for reliability
    system: 'System',  // Fallback system font
  },

  // Font sizes matching Beli's design hierarchy
  sizes: {
    xs: 11,    // Metadata, small labels
    sm: 13,    // Secondary information
    base: 15,  // Body text, standard UI
    lg: 17,    // Section headers, emphasis
    xl: 20,    // Screen titles
    '2xl': 24, // Major headers
    '3xl': 34, // Hero numbers (rankings)
  },

  // Font weights (using standard values for cross-platform compatibility)
  weights: {
    normal: '400' as const,   // Alias for regular
    regular: '400' as const,  // Body text
    medium: '500' as const,   // Subtle emphasis (may not render on all platforms)
    semibold: '600' as const, // Headers, buttons (may not render on all platforms)
    bold: '700' as const,     // Strong emphasis
  },

  // Line heights
  lineHeights: {
    tight: 1.2,   // For headings
    normal: 1.4,  // For body text
    relaxed: 1.6, // For captions
  },

  // Pre-defined text styles matching Beli's hierarchy
  textStyles: {
    // Headings
    h1: {
      fontSize: 34,
      fontWeight: '700' as const,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: 17,
      fontWeight: '600' as const,
      lineHeight: 1.3,
    },

    // Body text
    bodyLarge: {
      fontSize: 17,
      fontWeight: '400' as const,
      lineHeight: 1.4,
    },
    body: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 1.4,
    },
    bodySmall: {
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 1.4,
    },

    // Captions and metadata
    caption: {
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 1.3,
    },
    metadata: {
      fontSize: 11,
      fontWeight: '400' as const,
      lineHeight: 1.3,
    },

    // Interactive elements
    button: {
      fontSize: 15,
      fontWeight: '600' as const,
      lineHeight: 1.2,
    },
    buttonLarge: {
      fontSize: 17,
      fontWeight: '600' as const,
      lineHeight: 1.2,
    },

    // Special elements
    rating: {
      fontSize: 15,
      fontWeight: '700' as const,
      lineHeight: 1.0,
    },
    rank: {
      fontSize: 34,
      fontWeight: '700' as const,
      lineHeight: 1.0,
    },
  },
} as const;

export type FontSize = keyof typeof typography.sizes;
export type FontWeight = keyof typeof typography.weights;
export type LineHeight = keyof typeof typography.lineHeights;
export type TextStyleKey = keyof typeof typography.textStyles;
