import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#FF8C00",
        light: "#F5F5F5",
      },
    },
  },
  plugins: [
    ({ addVariant }: { addVariant: (name: string, definition: string) => void }) => {
      // Add a custom 'light' variant
      addVariant('light', '.light &');
    }
  ],
};

export default config;