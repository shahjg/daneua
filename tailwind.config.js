export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: { 50: '#FFFDF9', 100: '#faf8f5', 200: '#f0ebe3', 300: '#e6dfd4' },
        forest: { DEFAULT: '#2d4a3e', light: '#3d5f50', dark: '#1e3329' },
        gold: { 50: '#fefcf3', 100: '#fdf8e1', 200: '#f9efc4', 300: '#c4a35a', 400: '#b8944d', DEFAULT: '#c4a35a' },
        rose: { 50: '#fdf2f4', 100: '#fce7eb', 200: '#f9d0d9', 300: '#f4a3b5', 400: '#ed6b87', 500: '#e43d5f', 600: '#d01c4a' },
        ink: { 300: '#9ca3af', 400: '#6b7280', 500: '#4b5563', 600: '#374151', 700: '#1f2937' }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-sm': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'title': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'title-sm': ['1.25rem', { lineHeight: '1.4' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }]
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0,0,0,0.06)',
        'card': '0 4px 20px rgba(0,0,0,0.08)'
      }
    }
  },
  plugins: []
}
