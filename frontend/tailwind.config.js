/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#121212', // Main background (dark)
          light: '#181818',   // Card background
          dark: '#090909',    // Sidebar background
        },
        secondary: {
          DEFAULT: '#FFD700', // Gold accent
          light: '#FFDF4F',   // Lighter gold for hover states
          dark: '#D4AF37',    // Darker gold for active states
        },
        neutral: {
          DEFAULT: '#B3B3B3', // Default text
          light: '#FFFFFF',   // Bright text
          dark: '#727272',    // Subdued text
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
