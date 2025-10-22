import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Beli Brand Colors
      colors: {
        // Primary brand colors
        primary: {
          DEFAULT: '#0A6C70',
          dark: '#075159',
          light: '#E6F7FF',
          foreground: '#FFFFFF',
        },

        // Rating system colors
        rating: {
          excellent: '#22C55E',  // 8.5+ ratings
          good: '#84CC16',       // 7.0-8.4 ratings
          average: '#F59E0B',    // 5.0-6.9 ratings
          poor: '#EF4444',       // Below 5.0
        },

        // Semantic colors
        success: '#00A676',
        error: '#FF4D4F',
        warning: '#FAAD14',
        info: '#1890FF',
        destructive: {
          DEFAULT: '#FF4D4F',
          foreground: '#FFFFFF',
        },

        // Text colors
        foreground: '#000000',
        muted: {
          DEFAULT: '#8E8E93',
          foreground: '#C7C7CC',
        },

        // Background colors
        background: '#FAFAFA',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#000000',
        },
        secondary: {
          DEFAULT: '#F5F5F5',
          foreground: '#000000',
        },

        // Border colors
        border: '#E5E5EA',
        input: '#E5E5EA',
        ring: '#0A6C70',

        // Special colors
        streak: '#FF6B35',
        online: '#4CAF50',
        verified: '#1890FF',
        accent: {
          DEFAULT: '#F5F5F5',
          foreground: '#000000',
        },
      },

      // Typography
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'system-ui',
          'sans-serif',
        ],
      },

      fontSize: {
        xs: ['11px', { lineHeight: '1.3' }],
        sm: ['13px', { lineHeight: '1.4' }],
        base: ['15px', { lineHeight: '1.4' }],
        lg: ['17px', { lineHeight: '1.4' }],
        xl: ['20px', { lineHeight: '1.3' }],
        '2xl': ['24px', { lineHeight: '1.2' }],
        '3xl': ['34px', { lineHeight: '1.2' }],
      },

      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },

      // Spacing (matching mobile)
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
      },

      // Border radius
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '4px',
        full: '9999px',
        xl: '16px',
        '2xl': '24px',
      },

      // Shadows
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'DEFAULT': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },

      // Animation
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
