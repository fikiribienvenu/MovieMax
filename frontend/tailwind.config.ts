import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-bebas)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
      },
      colors: {
        bg: {
          primary: "#0a0a0f",
          secondary: "#111118",
          tertiary: "#1a1a24",
          card: "#1a1a24",
          elevated: "#222230",
        },
        brand: {
          red: "#e50914",
          "red-dark": "#b20710",
          gold: "#f5c518",
          "gold-dark": "#e6b800",
        },
        text: {
          primary: "#ffffff",
          secondary: "#b3b3cc",
          muted: "#6b6b85",
        },
        border: {
          DEFAULT: "#2a2a3a",
          subtle: "#1e1e2e",
        },
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(to top, #0a0a0f 0%, rgba(10,10,15,0.5) 50%, transparent 100%)",
        "hero-side": "linear-gradient(to right, rgba(10,10,15,0.9) 0%, transparent 60%)",
        "card-overlay": "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "scale-in": "scaleIn 0.3s ease forwards",
        shimmer: "shimmer 1.5s infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245,197,24,0.3)" },
          "50%": { boxShadow: "0 0 0 8px rgba(245,197,24,0)" },
        },
      },
      boxShadow: {
        card: "0 20px 40px rgba(0,0,0,0.5)",
        "card-hover": "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,197,24,0.15)",
        gold: "0 0 20px rgba(245,197,24,0.3)",
        red: "0 0 20px rgba(229,9,20,0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
