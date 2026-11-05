/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          darkest: '#06141B',
          dark: '#11212D',
          steel: '#253745',
          slate: '#4A5C6A',
          mist: '#9BA8AB',
          frost: '#CCD0CF',
          surface: '#F4F6F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
