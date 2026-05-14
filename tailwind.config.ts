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
        background: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-raised": "var(--color-surface-raised)",
        border: "var(--color-border)",
        "border-strong": "var(--color-border-strong)",
        primary: "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        muted: "var(--color-text-muted)",
        accent: "var(--color-accent)",
        "status-pending": "var(--color-status-pending)",
        "status-assigned": "var(--color-status-assigned)",
        "status-in-progress": "var(--color-status-in-progress)",
        "status-resolved": "var(--color-status-resolved)",
        "status-closed": "var(--color-status-closed)",
        "severity-low": "var(--color-severity-low)",
        "severity-medium": "var(--color-severity-medium)",
        "severity-high": "var(--color-severity-high)",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
