/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1d1d1b',
        'secondary-light': '#EFE9FF',
        'secondary-lighter': '#d3efdd',
        highlight: '#fdffd0',
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