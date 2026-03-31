/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Poppins", "sans-serif"],
      },
      colors: {
        background: "#f9f9ff",
        surface: "#ffffff",
        "surface-low": "#f0f4ff",
        "surface-high": "#e1e8fd",
        primary: "#004ac6",
        "primary-container": "#2563eb",
        accent: "#5c6880",
        content: "#141b2d",
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3.5rem",
      },
      boxShadow: {
        soft: "0 2px 10px rgba(0, 74, 198, 0.05)",
        premium: "0 20px 40px -10px rgba(0, 74, 198, 0.12)",
        elevated: "0 30px 60px -12px rgba(20, 27, 45, 0.15)",
        "tonal-sm": "0 4px 16px rgba(0, 74, 198, 0.04)",
        "tonal-md": "0 12px 32px rgba(0, 74, 198, 0.08)",
        "tonal-lg": "0 24px 64px rgba(0, 74, 198, 0.12)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
      },
    },
  },
  plugins: [],
};
