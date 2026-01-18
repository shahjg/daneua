/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Evergreen
        evergreen: {
          DEFAULT: '#05472A',
          50: '#E8F5EE',
          100: '#C5E6D4',
          200: '#9ED4B8',
          300: '#77C29C',
          400: '#4FAF80',
          500: '#2A8C5F',
          600: '#1D6B48',
          700: '#105A38',
          800: '#05472A',
          900: '#033A22',
        },
        // Background - Ivory
        ivory: {
          DEFAULT: '#FFFFF0',
          50: '#FFFFF9',
          100: '#FFFFF0',
          200: '#FAFAE5',
          300: '#F5F5DA',
          400: '#EBEBC8',
        },
        // Accent - Soft Pink
        blush: {
          DEFAULT: '#F8D7DA',
          50: '#FEF7F8',
          100: '#FCE4E7',
          200: '#F8D7DA',
          300: '#F2B5BC',
          400: '#E8939E',
          500: '#DC6B7A',
        },
        // Accent - Deep Red (for strong emotions)
        heart: {
          DEFAULT: '#8B1E3F',
          50: '#F9E8ED',
          100: '#EFCDD6',
          200: '#D98A9E',
          300: '#C44D6B',
          400: '#A63352',
          500: '#8B1E3F',
          600: '#6B1730',
        },
      },
      fontFamily: {
        // Elegant display font
        display: ['Playfair Display', 'Georgia', 'serif'],
        // Clean body font
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(5, 71, 42, 0.08)',
        'card': '0 8px 32px -4px rgba(5, 71, 42, 0.12)',
        'glow-pink': '0 0 40px -10px rgba(248, 215, 218, 0.6)',
        'glow-green': '0 0 40px -10px rgba(5, 71, 42, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
