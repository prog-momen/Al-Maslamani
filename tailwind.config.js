/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#67BB28',
          surface: '#F2EFE9',
          text: '#333333',
          title: '#000000',
          subtitle: '#1B1C1C',
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