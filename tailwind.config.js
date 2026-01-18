/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm off-white background
        cream: {
          DEFAULT: '#FAF9F6',
          50: '#FFFFFF',
          100: '#FAF9F6',
          200: '#F5F3EE',
          300: '#E8E4DF',
          400: '#D4CFC7',
        },
        // Deep forest green - primary
        forest: {
          DEFAULT: '#1A3C34',
          50: '#E8EDEB',
          100: '#C5D1CD',
          200: '#9FB3AC',
          300: '#6E8B81',
          400: '#4A6960',
          500: '#2D4F45',
          600: '#1A3C34',
          700: '#142E28',
          800: '#0E211D',
          900: '#081411',
        },
        // Muted gold - accent
        gold: {
          DEFAULT: '#C4A77D',
          50: '#FAF7F2',
          100: '#F2EBE0',
          200: '#E5D7C2',
          300: '#D4BF9E',
          400: '#C4A77D',
          500: '#B08F5C',
          600: '#927545',
          700: '#6F5835',
          800: '#4C3D24',
          900: '#2A2114',
        },
        // Soft black for text
        ink: {
          DEFAULT: '#2C2C2C',
          50: '#F5F5F5',
          100: '#E0E0E0',
          200: '#B8B8B8',
          300: '#8F8F8F',
          400: '#666666',
          500: '#4A4A4A',
          600: '#2C2C2C',
          700: '#1A1A1A',
          800: '#0D0D0D',
        },
        // Soft rose for subtle warmth
        rose: {
          DEFAULT: '#C9A9A6',
          100: '#F5EEEE',
          200: '#E5D6D4',
          300: '#D4BEBA',
          400: '#C9A9A6',
          500: '#B08D89',
        },
      },
      fontFamily: {
        // Elegant serif for headers
        serif: ['Cormorant Garamond', 'Georgia', 'Times New Roman', 'serif'],
        // Clean sans for body
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'title': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'subtitle': ['1.25rem', { lineHeight: '1.4' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'small': ['0.875rem', { lineHeight: '1.5' }],
        'tiny': ['0.75rem', { lineHeight: '1.4' }],
      },
      boxShadow: {
        'soft': '0 2px 16px -2px rgba(28, 28, 28, 0.06)',
        'card': '0 4px 24px -4px rgba(28, 28, 28, 0.08)',
        'elevated': '0 12px 40px -8px rgba(28, 28, 28, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
