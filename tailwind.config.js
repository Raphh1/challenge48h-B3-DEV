/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bordeaux: {
          50: '#fdf2f4',
          100: '#fbe8eb',
          200: '#f6d1d8',
          300: '#eeb0bc',
          400: '#e28498',
          500: '#d15975',
          600: '#7A1F2B', // Main Bordeaux color
          700: '#5A1720',
          800: '#4A141A',
          900: '#3A1014',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};