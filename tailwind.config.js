/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#faf9f6',
        ivory: '#f5f0eb',
        charcoal: '#1a1a2e',
        slate: '#3d3d5c',
        muted: '#8e8ea0',
        accent: '#8b2635', // deep burgundy
        'accent-light': '#a83242',
        gold: '#c9a84c',
        'gold-light': '#e0c872',
        'veg-green': '#2d8a4e',
        'nonveg-red': '#c0392b',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      screens: {
        tablet: '768px',
        desktop: '1200px',
      },
    },
  },
  plugins: [],
};