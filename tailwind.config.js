/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6200ee',
        secondary: '#03dac6',
        background: '#f5f5f5',
        surface: '#ffffff',
        error: '#b00020',
        text: {
          primary: '#000000',
          secondary: '#666666',
          disabled: '#9e9e9e',
        },
      },
    },
  },
  plugins: [],
}

