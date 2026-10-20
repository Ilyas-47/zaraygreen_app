/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#14532D",   // Dark Green
        secondary: "#22C55E", // Light Green
        beige: "#F5F5DC",     // Beige
        white: "#FFFFFF",
      },
    },
  },
  plugins: [],
}
