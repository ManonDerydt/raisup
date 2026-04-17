/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1d1d1b',
        'secondary-light': '#EFE9FF',
        'secondary-lighter': '#d8ffbd',
        highlight: '#fdffd0',
        'rose-accent': '#F4B8CC',
        'hero-bg': '#0A0A0A',
        'cta-bg': '#FFD6E5',
        'testimonial-bg': '#F9F9F9',
        'raisup-pink': '#F4B8CC',
        'raisup-pink-pale': '#FFD6E5',
        'raisup-pink-dark': '#C4728A',
        'raisup-black': '#0A0A0A',
        'raisup-bg': '#F8F8F8',
        'raisup-green': '#D8FFBD',
        'raisup-blue': '#ABC5FE',
        'raisup-purple': '#CDB4FF',
        'raisup-orange': '#FFB96D',
        'raisup-red': '#FFB3B3',
      },
      borderRadius: {
        xl: '12px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};