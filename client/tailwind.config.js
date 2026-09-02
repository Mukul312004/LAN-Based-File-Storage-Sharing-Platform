/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cursor: {
          orange: '#f54e00',
          'orange-active': '#d04200',
          ink: '#26251e',
          body: '#5a5852',
          muted: '#807d72',
          'muted-soft': '#a09c92',
          hairline: '#e6e5e0',
          'hairline-soft': '#efeee8',
          'hairline-strong': '#cfcdc4',
          canvas: '#f7f7f4',
          'canvas-soft': '#fafaf7',
          card: '#ffffff',
          'timeline-thinking': '#dfa88f',
          'timeline-grep': '#9fc9a2',
          'timeline-read': '#9fbbe0',
          'timeline-edit': '#c0a8dd',
          'timeline-done': '#c08532',
          // Dark mode counterparts
          'dark-canvas': '#141412',
          'dark-canvas-soft': '#1a1916',
          'dark-card': '#201f1b',
          'dark-hairline': '#2d2b26',
          'dark-hairline-strong': '#3d3b34',
          'dark-ink': '#f7f7f4',
          'dark-body': '#9e9b91',
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      borderRadius: {
        md: '8px',
        lg: '12px',
      },
      letterSpacing: {
        editorial: '-0.025em',
        'display-lg': '-0.035em',
      },
    },
  },
  plugins: [],
}
