/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#1E2A5A',
          DEFAULT: '#2A3A7A',
        },
        accent: {
          teal: '#1FB6A6',
          'teal-dark': '#17A293',
        },
        feature: {
          violet: '#6C63FF',
          'violet-dark': '#5A52E8',
        },
        background: {
          light: '#F8FAFF',
          lighter: '#EEF2FF',
        },
        text: {
          primary: '#1B1B1B',
          secondary: '#5A5A7A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
