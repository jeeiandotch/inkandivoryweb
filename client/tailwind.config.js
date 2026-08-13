/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: "#faf6ef",
          50: "#fffdfa",
          100: "#faf6ef",
          200: "#f2ead9",
          300: "#e8dcc3",
        },
        ink: {
          DEFAULT: "#241f1c",
          light: "#453e38",
          soft: "#5c534b",
        },
        taupe: {
          DEFAULT: "#a67c6d",
          light: "#c4a08f",
          dark: "#7d5c50",
        },
        rose: {
          dusty: "#c98f92",
        },
        parchment: "#f4ecdd",
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "'Playfair Display'", "Georgia", "serif"],
        display: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        script: ["'Dancing Script'", "cursive"],
      },
      boxShadow: {
        soft: "0 4px 20px rgba(36, 31, 28, 0.06)",
        lift: "0 8px 30px rgba(36, 31, 28, 0.10)",
      },
      backgroundImage: {
        grain: "url('/textures/grain.png')",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: "translateY(6px)" }, to: { opacity: 1, transform: "translateY(0)" } },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
