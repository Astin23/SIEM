/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'custom': ['AeroSemibold', 'AeroRetina', 'sans-serif'], 
        'mono': ['DM Mono', 'monospace'],          
      },
      colors: {
        'sentrix-blue': '#0095ff', 
      }
    },
  },
  plugins: [],
}