/**
 * Centralized color constants for the Beli design system
 * These colors should be used throughout the application for consistency
 */

// Brand Colors
export const COLORS = {
  // Primary brand color (teal)
  primary: '#0B7B7F',

  // Rating Colors (for score bubbles and indicators)
  rating: {
    excellent: '#10B981', // green-500 - for ratings 8.0+
    good: '#84CC16', // lime-500 - for ratings 6.0-7.9
    average: '#F59E0B', // amber-500 - for ratings 4.0-5.9
    poor: '#EF4444', // red-500 - for ratings below 4.0
  },

  // Accent Colors
  accent: {
    streak: '#FF6B35', // Orange for streak indicators
  },

  // UI Colors
  ui: {
    border: '#D9D9DE', // Light gray for borders
  },
} as const;

/**
 * Get the appropriate color for a rating score
 * @param rating - The numerical rating (typically 0-10)
 * @returns Hex color code
 */
export function getRatingColor(rating: number): string {
  if (rating >= 8) return COLORS.rating.excellent;
  if (rating >= 6) return COLORS.rating.good;
  if (rating >= 4) return COLORS.rating.average;
  return COLORS.rating.poor;
}
