import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Habilitamos el modo oscuro por clase
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        card: 'var(--card)',
        elevated: 'var(--elevated)',
        overlay: 'var(--overlay)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        subtle: 'var(--subtle)',
        accent: {
          DEFAULT: 'var(--accent)',
          light: 'var(--accent-light)',
          dark: 'var(--accent-dark)',
          glow: 'var(--accent-glow)',
          muted: 'var(--accent-muted)',
        },
        success: {
          DEFAULT: 'var(--success)',
          glow: 'var(--success-glow)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          glow: 'var(--warning-glow)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          glow: 'var(--danger-glow)',
        },
        info: {
          DEFAULT: 'var(--info)',
          glow: 'var(--info-glow)',
        },
        border: {
          DEFAULT: 'var(--border)',
          light: 'var(--border-light)',
          hover: 'var(--border-hover)',
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "fluid-xs": ["clamp(0.68rem, 0.62rem + 0.25vw, 0.78rem)", "1.4"],
        "fluid-sm": ["clamp(0.78rem, 0.72rem + 0.3vw, 0.88rem)", "1.4"],
        "fluid-base": ["clamp(0.88rem, 0.82rem + 0.3vw, 0.95rem)", "1.5"],
        "fluid-lg": ["clamp(1.05rem, 0.95rem + 0.5vw, 1.25rem)", "1.3"],
        "fluid-xl": ["clamp(1.25rem, 1.05rem + 1vw, 1.75rem)", "1.2"],
        "fluid-2xl": ["clamp(1.5rem, 1.15rem + 1.8vw, 2.4rem)", "1.1"],
        "fluid-3xl": ["clamp(1.8rem, 1.25rem + 2.8vw, 3.2rem)", "1.1"],
        "fluid-4xl": ["clamp(2.2rem, 1.3rem + 4.5vw, 4.8rem)", "1.05"],
        "fluid-hero": ["clamp(2.8rem, 1.8rem + 5.5vw, 6.5rem)", "1.05"],
      },
      borderRadius: {
        soft: "12px",
        base: "16px",
        lg: "20px",
        xl: "24px",
        "2xl": "28px",
        "3xl": "32px",
        pill: "9999px",
        card: "20px",
      },
      animation: {
        "spring-up": "spring-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "spring-in": "spring-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
      keyframes: {
        "spring-up": {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "spring-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      boxShadow: {
        float: "0 2px 4px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.25), 0 24px 48px rgba(0,0,0,0.15)",
        card: "0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.2)",
        glow: "var(--accent-glow)",
        "glow-accent": "var(--accent-glow)",
        "glow-success": "var(--success-glow)",
        "glow-danger": "var(--danger-glow)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        standard: "350ms",
        fast: "200ms",
        slow: "600ms",
      },
    },
  },
  plugins: [],
};
export default config;
