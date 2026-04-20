/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blood: {
          50: '#fdf2f2',
          100: '#fce8e8',
          200: '#f8b4b4',
          300: '#f17171',
          400: '#e74444',
          500: '#c0392b',
          600: '#8b0000',
          700: '#6b0000',
          800: '#4a0000',
          900: '#2d0000',
        },
        gothic: {
          50: '#f5f3f0',
          100: '#e8e0d0',
          200: '#c9b99a',
          300: '#b09070',
          400: '#8a6b45',
          500: '#6b4f2d',
          600: '#4a3520',
          700: '#2d1f10',
          800: '#1a1208',
          900: '#0d0804',
        },
        dark: {
          50: '#9a8f9f',
          100: '#6b5f70',
          200: '#3d3345',
          300: '#2a2035',
          400: '#1e1628',
          500: '#14101e',
          600: '#0f0c18',
          700: '#0a0810',
          800: '#060408',
          900: '#030204',
        },
        gold: {
          300: '#f0d060',
          400: '#d4af37',
          500: '#b8962e',
          600: '#9a7d25',
        },
      },
      fontFamily: {
        gothic: ['Cinzel', 'Georgia', 'serif'],
        body: ['Crimson Text', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gothic-gradient': 'linear-gradient(135deg, #0a0810 0%, #14101e 50%, #0f0c18 100%)',
      },
      animation: {
        'pulse-blood': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}


