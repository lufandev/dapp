/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        "primary-color": "var(--primary-color)",
        "secondary-color": "var(--secondary-color)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        "card-background": "var(--card-background)",
        "border-color": "var(--border-color)",
        "success-color": "var(--success-color)",
        "warning-color": "var(--warning-color)",
        "error-color": "var(--error-color)",
      },
    },
  },
  plugins: [],
};
