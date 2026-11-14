/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        obsidian: {
          950: '#000000',
          900: '#0A0A0C',
          850: '#111115',
          800: '#16161B',
          700: '#1F1F24',
          600: '#27272A'
        }
      }
    },
  },
  plugins: [],
}
