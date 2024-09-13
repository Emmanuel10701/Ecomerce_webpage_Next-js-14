import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        'example-color': 'oklch(0.5 0.3 0.4)', // Find and replace this
      },
      keyframes: {
        dotFlashing: {
          '0%': { opacity: '0.1' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.1' },
        },
      },
      animation: {
        dotFlashing: 'dotFlashing 1.5s infinite ease-in-out',
      },
    },
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/forms'),
  ],
};

export default config;
