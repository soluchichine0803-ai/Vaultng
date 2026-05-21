/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: "#050508",
          secondary: "#0B0B12",
        },
        card: {
          DEFAULT: "#13131D",
          elevated: "#1A1A28",
        },
        purple: {
          primary: "#7C3AED",
          bright: "#8B5CF6",
          neon: "#A855F7",
          soft: "#C084FC",
          deep: "#5B21B6",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#06B6D4",
        text: {
          primary: "#F5F3FF",
          secondary: "#D8B4FE",
          muted: "#8B5CF6",
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
