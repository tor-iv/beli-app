export const animations = {
  // Durations (in milliseconds)
  duration: {
    fast: 150,      // Quick feedback (button press)
    normal: 250,    // Standard transitions
    slow: 400,      // Complex animations
    slower: 600,    // Page transitions
  },

  // Easing curves
  easing: {
    linear: [0, 0, 1, 1],
    ease: [0.25, 0.1, 0.25, 1],
    easeIn: [0.42, 0, 1, 1],
    easeOut: [0, 0, 0.58, 1],
    easeInOut: [0.42, 0, 0.58, 1],

    // Custom curves for different use cases
    bounce: [0.68, -0.55, 0.265, 1.55],    // Bouncy effect
    snap: [0.25, 0.46, 0.45, 0.94],       // Snappy feel
    smooth: [0.4, 0, 0.2, 1],             // Smooth material motion
  },

  // Scale values for press states
  scale: {
    press: 0.98,     // Button press feedback
    hover: 1.02,     // Hover state
    active: 0.95,    // Active/selected state
  },

  // Opacity values for states
  opacity: {
    disabled: 0.4,   // Disabled elements
    pressed: 0.7,    // Pressed state
    overlay: 0.5,    // Modal overlays
    loading: 0.6,    // Loading states
  },

  // Spring configurations (for react-native-reanimated)
  spring: {
    gentle: {
      damping: 20,
      stiffness: 150,
      mass: 1,
    },
    bouncy: {
      damping: 10,
      stiffness: 100,
      mass: 1,
    },
    snappy: {
      damping: 25,
      stiffness: 300,
      mass: 1,
    },
  },

  // Common animation presets
  presets: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: 250,
      easing: 'easeOut',
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: 200,
      easing: 'easeIn',
    },
    slideInRight: {
      from: { transform: [{ translateX: 300 }], opacity: 0 },
      to: { transform: [{ translateX: 0 }], opacity: 1 },
      duration: 300,
      easing: 'easeOut',
    },
    slideInLeft: {
      from: { transform: [{ translateX: -300 }], opacity: 0 },
      to: { transform: [{ translateX: 0 }], opacity: 1 },
      duration: 300,
      easing: 'easeOut',
    },
    slideUp: {
      from: { transform: [{ translateY: 50 }], opacity: 0 },
      to: { transform: [{ translateY: 0 }], opacity: 1 },
      duration: 300,
      easing: 'easeOut',
    },
    scale: {
      from: { transform: [{ scale: 0.9 }], opacity: 0 },
      to: { transform: [{ scale: 1 }], opacity: 1 },
      duration: 200,
      easing: 'easeOut',
    },
    bounce: {
      from: { transform: [{ scale: 0.3 }], opacity: 0 },
      to: { transform: [{ scale: 1 }], opacity: 1 },
      duration: 400,
      easing: 'bounce',
    },
  },
} as const;

export type AnimationDuration = keyof typeof animations.duration;
export type AnimationEasing = keyof typeof animations.easing;
export type AnimationPreset = keyof typeof animations.presets;