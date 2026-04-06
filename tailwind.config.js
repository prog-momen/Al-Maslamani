/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#1F8A5B',
          greenSoft: '#DDEFD9',
          pink: '#F9D9E3',
        },
      },
    },
  },
  plugins: [],
};