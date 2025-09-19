// Import theme tokens
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';
import { animations } from './animations';

// Re-export theme tokens
export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { shadows } from './shadows';
export { animations } from './animations';

// Theme types
export type { ColorKey } from './colors';
export type { FontSize, FontWeight, LineHeight, TextStyleKey } from './typography';
export type { SpacingKey, BorderRadiusKey } from './spacing';
export type { ShadowKey } from './shadows';
export type { AnimationDuration, AnimationEasing, AnimationPreset } from './animations';

// Combined theme object
export const theme = {
  colors,
  typography,
  spacing,
  shadows,
  animations,
} as const;
