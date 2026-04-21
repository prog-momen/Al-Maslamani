/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#84BD00',
          secondary: '#4CAF50',
          background: '#F2EFE9',
          surface: '#F2EFE9',
          text: '#1B1C1C',
          error: '#D32F2F',
        },
      },
      fontFamily: {
        'tajawal-regular': ['Tajawal_400Regular'],
        'tajawal-medium': ['Tajawal_500Medium'],
        'tajawal-bold': ['Tajawal_700Bold'],
        'tajawal': ['Tajawal_400Regular'],
      },
    },
  },
  plugins: [],
};