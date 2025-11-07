// Color utilities
export const RATING_COLORS = {
  excellent: 'rating-excellent',
  good: 'rating-good',
  average: 'rating-average',
  poor: 'rating-poor',
} as const;

export function getRatingColor(rating: number): keyof typeof RATING_COLORS {
  if (rating >= 8.5) return 'excellent';
  if (rating >= 7.0) return 'good';
  if (rating >= 5.0) return 'average';
  return 'poor';
}

// Spacing constants
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  mobile: 640, // sm
  tablet: 768, // md
  desktop: 1024, // lg
  wide: 1280, // xl
} as const;
