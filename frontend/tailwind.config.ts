import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        charcoal: "#1E293B",
        purple: {
          DEFAULT: "#6C3BFF",
          50: "#F4F0FF",
          100: "#E7DEFF",
          400: "#8F6BFF",
          500: "#6C3BFF",
          600: "#5A2AE8",
          700: "#4820B8",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E8CB6B",
        },
        surface: "#F8FAFC",
        surface2: "#EEF2FF",
        muted: "#64748B",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        xl2: "20px",
        xl3: "28px",
        xl4: "32px",
      },
      boxShadow: {
        soft: "0 8px 40px -12px rgba(15,23,42,0.12)",
        glow: "0 0 60px -10px rgba(108,59,255,0.35)",
        card: "0 2px 8px rgba(15,23,42,0.04), 0 20px 40px -20px rgba(15,23,42,0.10)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, transparent, white), linear-gradient(to right, rgba(108,59,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(108,59,255,0.06) 1px, transparent 1px)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-16px) rotate(4deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        blink: "blink 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
