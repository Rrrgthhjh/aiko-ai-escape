import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        danger: "hsl(var(--danger))",
        warning: "hsl(var(--warning))",
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        sans: ['Zen Maru Gothic', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in": { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "char-breathe": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-4px) scale(1.006)" },
        },
        "char-sway": {
          "0%, 100%": { transform: "rotate(-0.6deg) translateX(-2px)" },
          "50%": { transform: "rotate(0.6deg) translateX(2px)" },
        },
        "char-blink": {
          "0%, 92%, 100%": { filter: "none" },
          "94%, 97%": { filter: "brightness(0.85) contrast(1.1)" },
        },
        "mood-fade": {
          "0%": { opacity: "0", transform: "scale(0.98) translateY(6px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "gesture-shake": {
          "0%,100%": { transform: "translateX(0) rotate(0deg)" },
          "25%": { transform: "translateX(-2px) rotate(-0.4deg)" },
          "50%": { transform: "translateX(2px) rotate(0.4deg)" },
          "75%": { transform: "translateX(-1px) rotate(-0.2deg)" },
        },
        "gesture-nod": {
          "0%,100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(2px) rotate(0.6deg)" },
        },
        "gesture-lookaway": {
          "0%,100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(3px) rotate(-0.3deg)" },
        },
        "gesture-tremble": {
          "0%,100%": { transform: "translate(0,0)" },
          "25%": { transform: "translate(-0.8px, 0.5px)" },
          "50%": { transform: "translate(0.8px, -0.5px)" },
          "75%": { transform: "translate(-0.5px, 0.8px)" },
        },
        "gesture-bounce": {
          "0%,100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-4px) scale(1.005)" },
        },
        "gesture-shy-sway": {
          "0%,100%": { transform: "rotate(0deg) translateX(0)" },
          "50%": { transform: "rotate(-0.6deg) translateX(-1.5px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "char-breathe": "char-breathe 4.2s ease-in-out infinite",
        "char-sway": "char-sway 7s ease-in-out infinite",
        "char-blink": "char-blink 6s ease-in-out infinite",
        "mood-fade": "mood-fade 0.55s ease-out",
        "gesture-shake": "gesture-shake 0.9s ease-in-out infinite",
        "gesture-nod": "gesture-nod 2.4s ease-in-out infinite",
        "gesture-lookaway": "gesture-lookaway 3.2s ease-in-out infinite",
        "gesture-tremble": "gesture-tremble 0.5s ease-in-out infinite",
        "gesture-bounce": "gesture-bounce 1.8s ease-in-out infinite",
        "gesture-shy-sway": "gesture-shy-sway 2.6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
