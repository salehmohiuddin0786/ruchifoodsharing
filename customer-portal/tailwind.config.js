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
        ruchi: {
          midnight: '#0B132B',
          navy: '#1C2541',
          dusk: '#3A506B',
          cyan: '#5BC0DE',
          sand: '#F4D6B0',
          amber: '#D97706',
          bg: '#FCFAF7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
