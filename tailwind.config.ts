import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Inter'", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#EEF5FF",
          100: "#D6E7FF",
          200: "#ADCFFF",
          300: "#7FB5FF",
          400: "#4F95FF",
          500: "#2D74FF",
          600: "#1959DB",
          700: "#1344AA",
          800: "#0D2F78",
          900: "#081D4A"
        }
      },
      boxShadow: {
        ambient: "0 32px 80px -40px rgba(15, 23, 42, 0.4)"
      }
    }
  },
  plugins: []
};

export default config;
