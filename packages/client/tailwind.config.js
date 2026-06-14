/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#09090c',
        surface: '#111116',
        card: '#16161c',
        raised: '#1c1c24',
        rule: '#252530',
        ruleHi: '#38383e',
        dim: '#72708a',
        dimLo: '#35334a',
        dimXlo: '#1e1d28',
        sangue: '#c41e1e',
        ouro: '#c88c0a',
        verde: '#1a6b3a',
        azul: '#1a3f7a',
        roxo: '#5a1a7a',
        cinza: '#4a5060',
      },
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'sans-serif'],
        mono: ['"Courier New"', 'monospace'],
        black: ['"Arial Black"', '"Impact"', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
