/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8b45ff',
          light: '#a66dff',
          dark: '#6b2dc7',
        },
        secondary: {
          DEFAULT: '#ff4586',
          light: '#ff6da0',
          dark: '#cc3069',
        },
        glass: {
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.2)',
          text: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
  },
  plugins: [],
}