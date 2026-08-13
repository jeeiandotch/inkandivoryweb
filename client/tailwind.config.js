/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: "rgb(var(--c-ivory) / <alpha-value>)",
          50: "rgb(var(--c-ivory) / <alpha-value>)",
          100: "rgb(var(--c-ivory) / <alpha-value>)",
          200: "rgb(var(--c-surface) / <alpha-value>)",
          300: "rgb(var(--c-surface) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--c-ink) / <alpha-value>)",
          light: "rgb(var(--c-ink) / <alpha-value>)",
          soft: "rgb(var(--c-ink) / <alpha-value>)",
        },
        taupe: {
          DEFAULT: "rgb(var(--c-secondary) / <alpha-value>)",
          light: "rgb(var(--c-secondary) / <alpha-value>)",
          dark: "rgb(var(--c-secondary) / <alpha-value>)",
        },
        rose: {
          dusty: "#c17b8f",
        },
        wine: {
          DEFAULT: "rgb(var(--c-primary) / <alpha-value>)",
          light: "rgb(var(--c-primary) / <alpha-value>)",
          dark: "rgb(var(--c-primary) / <alpha-value>)",
        },
        gold: {
          DEFAULT: "rgb(var(--c-gold) / <alpha-value>)",
          light: "rgb(var(--c-gold) / <alpha-value>)",
        },
        parchment: "rgb(var(--c-surface) / <alpha-value>)",
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
