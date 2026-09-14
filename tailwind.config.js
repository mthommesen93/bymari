/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "warm-white": "#F7F5F0",
        "charcoal": "#20211F",
        "forest-green": {
          DEFAULT: "#34463B",
          hover: "#29372E",
          light: "#EBF0EC",
        },
        "sage": {
          DEFAULT: "#899487",
          light: "#F0F3F0",
          dark: "#6C776A",
        },
        "sand": {
          DEFAULT: "#DED7CB",
          light: "#F4F1EB",
          dark: "#C8BFB1",
        },
        "warm-taupe": {
          DEFAULT: "#A59888",
          light: "#F5F2EE",
          dark: "#877B6C",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        brand: "0.18em",
        "wide-editorial": "0.04em",
      },
    },
  },
  plugins: [],
};