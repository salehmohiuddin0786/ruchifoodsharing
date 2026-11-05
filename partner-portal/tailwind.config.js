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
        partner: {
          pine: '#0F1F17',
          forest: '#1E3A2E',
          olive: '#3E5A3F',
          sage: '#6B7F67',
          cream: '#C7CBB8',
          moss: '#3D4337',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
