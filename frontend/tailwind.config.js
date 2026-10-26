/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          dark: '#0B1120',      // Deep navy/charcoal
          card: '#131D31',      // Card surface
          border: '#1F2E4A',    // Border lines
          muted: '#64748B',     // Slate muted text
          light: '#F8FAFC',     // Clean white/light surface
        },
        alert: {
          critical: '#EF4444',  // Red
          high: '#F97316',      // Orange
          moderate: '#EAB308',  // Amber / Yellow
          low: '#10B981',       // Emerald Green
          info: '#3B82F6',      // Primary Blue
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
