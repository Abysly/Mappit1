/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";
export default {
  content: [
    "./index.html",
    "./src/**/*.{html,js}",
    "./src/components/*.{html}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out forwards",
      },
    },
  },
  plugins: [require("flowbite/plugin"), daisyui],
  daisyui: {
    themes: [false],
  },
};
