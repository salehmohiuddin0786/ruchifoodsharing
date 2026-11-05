/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ruchi: {
          forest: '#174D36',      // Primary Forest Green
          forestDark: '#0F3826',
          fresh: '#65A878',       // Secondary Fresh Green
          freshLight: '#E8F5EC',
          orange: '#F5A623',      // Accent Warm Orange
          orangeHover: '#DE9319',
          cream: '#FFF9EE',       // App Background Cream
          creamCard: '#FFFFFF',
          dark: '#1C2E24',
          muted: '#607267',
          border: '#E2E8E4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
