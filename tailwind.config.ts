import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          purple: "#650D57",
          blue: "#1851A2",
          gold: "#FFD912",
          gray: "#4F4E4D",
          red: "#C2232E",
          "orange-dark": "#AE100F",
          orange: "#EA3E11",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "sans-serif"],
        montserrat: ["var(--font-montserrat)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #650D57 0%, #1851A2 50%, #AE100F 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
