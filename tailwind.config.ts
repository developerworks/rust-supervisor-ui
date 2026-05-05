import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{vue,ts}",
    "./tests/**/*.{ts,vue}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem"
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        status: {
          healthy: "#15803d",
          warning: "#b45309",
          danger: "#b91c1c",
          info: "#2563eb",
          neutral: "#64748b"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      boxShadow: {
        panel: "0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 28px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;
