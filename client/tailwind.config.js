/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: "#fdf7f6",
          50: "#fffbfa",
          100: "#fdf1ef",
          200: "#f9e2df",
          300: "#f3d0cd",
        },
        ink: {
          DEFAULT: "#2c2024",
          light: "#4a363c",
          soft: "#5c4750",
        },
        taupe: {
          DEFAULT: "#b5677a",
          light: "#c98f9d",
          dark: "#7a2b40",
        },
        rose: {
          dusty: "#c17b8f",
        },
        wine: {
          DEFAULT: "#7a2b40",
          light: "#9c4058",
          dark: "#5c1f30",
        },
        gold: {
          DEFAULT: "#c9a227",
          light: "#e0c364",
        },
        parchment: "#f9ece7",
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
        floatSlow: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        shimmer: { "0%": { backgroundPosition: "0% 50%" }, "100%": { backgroundPosition: "200% 50%" } },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "float-slow": "floatSlow 5s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};
