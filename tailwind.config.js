/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm cream backgrounds
        cream: {
          DEFAULT: '#FAF9F6',
          50: '#FFFFFF',
          100: '#FAF9F6',
          200: '#F3F1EB',
          300: '#E8E4DC',
          400: '#D9D3C7',
        },
        // Deep forest green - primary
        forest: {
          DEFAULT: '#1A3C34',
          50: '#EEF3F1',
          100: '#D4E0DC',
          200: '#A8C1B8',
          300: '#7DA295',
          400: '#518371',
          500: '#2D5A4C',
          600: '#1A3C34',
          700: '#132B26',
          800: '#0D1D19',
          900: '#060E0C',
        },
        // Muted gold - accent
        gold: {
          DEFAULT: '#C4A77D',
          50: '#FCF9F4',
          100: '#F5EDDF',
          200: '#EBDBBF',
          300: '#DCC59A',
          400: '#C4A77D',
          500: '#A98A5B',
          600: '#846A45',
          700: '#5F4C32',
          800: '#3A2F1F',
          900: '#1A150E',
        },
        // Soft rose - warmth
        rose: {
          DEFAULT: '#C9A5A5',
          50: '#FBF7F7',
          100: '#F5EBEB',
          200: '#E8D4D4',
          300: '#DBBDBD',
          400: '#C9A5A5',
          500: '#B08585',
          600: '#8F6565',
          700: '#6B4C4C',
          800: '#473232',
          900: '#231919',
        },
        // Soft black for text
        ink: {
          DEFAULT: '#1F2421',
          50: '#F7F7F7',
          100: '#E3E4E3',
          200: '#C7C9C8',
          300: '#9A9D9B',
          400: '#6D716F',
          500: '#454847',
          600: '#1F2421',
          700: '#171A18',
          800: '#0F110F',
          900: '#080908',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        // Display - hero headlines
        'display-xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '500' }],
        'display': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '500' }],
        'display-sm': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '500' }],
        // Titles
        'title': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '500' }],
        'title-sm': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '500' }],
        // Body
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        // Small
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.05em' }],
        'tiny': ['0.6875rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.03em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(26, 60, 52, 0.08)',
        'card': '0 4px 24px -6px rgba(26, 60, 52, 0.1)',
        'elevated': '0 12px 48px -12px rgba(26, 60, 52, 0.15)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(26, 60, 52, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
