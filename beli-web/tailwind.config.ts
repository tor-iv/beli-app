import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: '#0A6C70',
  				dark: '#075159',
  				light: '#E6F7FF',
  				foreground: '#FFFFFF'
  			},
  			rating: {
  				excellent: '#22C55E',
  				good: '#84CC16',
  				average: '#F59E0B',
  				poor: '#EF4444'
  			},
  			success: '#00A676',
  			error: '#FF4D4F',
  			warning: '#FAAD14',
  			info: '#1890FF',
  			destructive: {
  				DEFAULT: '#FF4D4F',
  				foreground: '#FFFFFF'
  			},
  			foreground: '#000000',
  			muted: {
  				DEFAULT: '#8E8E93',
  				foreground: '#C7C7CC'
  			},
  			background: '#FAFAFA',
  			card: {
  				DEFAULT: '#FFFFFF',
  				foreground: '#000000'
  			},
  			secondary: {
  				DEFAULT: '#F5F5F5',
  				foreground: '#000000'
  			},
  			border: '#E5E5EA',
  			input: '#E5E5EA',
  			ring: '#0A6C70',
  			streak: '#FF6B35',
  			online: '#4CAF50',
  			verified: '#1890FF',
  			accent: {
  				DEFAULT: '#F5F5F5',
  				foreground: '#000000'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'SF Pro Display',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		fontSize: {
  			xs: [
  				'11px',
  				{
  					lineHeight: '1.3'
  				}
  			],
  			sm: [
  				'13px',
  				{
  					lineHeight: '1.4'
  				}
  			],
  			base: [
  				'15px',
  				{
  					lineHeight: '1.4'
  				}
  			],
  			lg: [
  				'17px',
  				{
  					lineHeight: '1.4'
  				}
  			],
  			xl: [
  				'20px',
  				{
  					lineHeight: '1.3'
  				}
  			],
  			'2xl': [
  				'24px',
  				{
  					lineHeight: '1.2'
  				}
  			],
  			'3xl': [
  				'34px',
  				{
  					lineHeight: '1.2'
  				}
  			]
  		},
  		fontWeight: {
  			normal: '400',
  			medium: '500',
  			semibold: '600',
  			bold: '700'
  		},
  		spacing: {
  			'18': '4.5rem',
  			'22': '5.5rem'
  		},
  		borderRadius: {
  			lg: '12px',
  			md: '8px',
  			sm: '4px',
  			full: '9999px',
  			xl: '16px',
  			'2xl': '24px'
  		},
  		boxShadow: {
  			none: '0 0 0 rgba(0, 0, 0, 0)',
  			sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
  			DEFAULT: '0 2px 8px rgba(0, 0, 0, 0.08)',
  			md: '0 4px 12px rgba(0, 0, 0, 0.08)',
  			lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
  			button: '0 1px 4px rgba(0, 0, 0, 0.04)',
  			card: '0 2px 8px rgba(0, 0, 0, 0.08)',
  			cardElevated: '0 4px 12px rgba(0, 0, 0, 0.12)',
  			modal: '0 8px 16px rgba(0, 0, 0, 0.16)',
  			tabBar: '0 -2px 8px rgba(0, 0, 0, 0.08)'
  		},
  		keyframes: {
  			shimmer: {
  				'0%': {
  					backgroundPosition: '-1000px 0'
  				},
  				'100%': {
  					backgroundPosition: '1000px 0'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			shimmer: 'shimmer 2s infinite linear',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
