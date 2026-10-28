/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      colors: {
        white: '#F5F5DC',
        beige: {
          DEFAULT: '#F5F5DC',
          50: '#FAF9EE',
          100: '#F5F5DC',
          200: '#EDECCB',
          300: '#E4E3BA',
        },
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface)",
        raised: "var(--bg-surface-raised)",
        sidebar: "var(--bg-sidebar)",
        line: "var(--border-subtle)",
        "line-strong": "var(--border-strong)",
        ink: {
          DEFAULT: "var(--text-primary)",
          2: "var(--text-secondary)",
          3: "var(--text-tertiary)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          violet: "var(--accent-violet)",
        },
        ai: {
          detect: "var(--ai-detect)",
        },
        sev: {
          critical: "var(--sev-critical)",
          high: "var(--sev-high)",
          medium: "var(--sev-medium)",
          low: "var(--sev-low)",
        },
        status: {
          open: "var(--status-open)",
          progress: "var(--status-progress)",
          resolved: "var(--status-resolved)",
          reopened: "var(--status-reopened)",
        },
        cat: {
          pothole: "var(--cat-pothole)",
          light: "var(--cat-light)",
          garbage: "var(--cat-garbage)",
          water: "var(--cat-water)",
          structure: "var(--cat-structure)",
          other: "var(--cat-other)",
        },
      },
      borderRadius: {
        panel: "18px",
        card: "14px",
        control: "10px",
      },
      backgroundImage: {
        "accent-gradient": "var(--accent-gradient)",
      },
    },
  },
  plugins: [],
};
