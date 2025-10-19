/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { celoYellow: "#FCFF52", celoBlack: "#1A1A1A" },
      fontFamily: { satoshi: ["Satoshi", "sans-serif"] },
    },
  },
  plugins: [],
};
