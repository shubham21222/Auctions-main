/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          gold: "#D4AF37",
          cream: "#F5F5DC",
          charcoal: "#36454F",
          pearl: "#F0EAD6",
        },
        border: "hsl(var(--border, 214 31% 91%))", // Fallback to gray
        input: "hsl(var(--input, 214 31% 91%))",
        ring: "hsl(var(--ring, 216 100% 50%))",
        background: "hsl(var(--background, 0 0% 100%))", // Default white
        foreground: "hsl(var(--foreground, 222 47% 11%))",
        primary: {
          DEFAULT: "hsl(var(--primary, 216 100% 50%))",
          foreground: "hsl(var(--primary-foreground, 0 0% 100%))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary, 210 40% 96%))",
          foreground: "hsl(var(--secondary-foreground, 222 47% 11%))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive, 0 84% 60%))",
          foreground: "hsl(var(--destructive-foreground, 0 0% 100%))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted, 210 40% 96%))",
          foreground: "hsl(var(--muted-foreground, 215 16% 47%))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent, 210 40% 96%))",
          foreground: "hsl(var(--accent-foreground, 222 47% 11%))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover, 0 0% 100%))", // White for dropdowns
          foreground: "hsl(var(--popover-foreground, 222 47% 11%))",
        },
        card: {
          DEFAULT: "hsl(var(--card, 0 0% 100%))", // White for cards
          foreground: "hsl(var(--card-foreground, 222 47% 11%))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(100px)", filter: "blur(33px)" },
          "100%": { opacity: 1, transform: "translateY(0)", filter: "blur(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        float: "float 3s ease-in-out infinite",
        "fade-in": "fadeIn 1s ease-in-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};