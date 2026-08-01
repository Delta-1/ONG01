/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta orgânica: floresta, rio, terra, sol amazônico
        forest: {
          50: '#f0f7f1',
          100: '#dbeede',
          200: '#b9ddc0',
          300: '#8bc499',
          400: '#57a56d',
          500: '#35874e',
          600: '#256b3d',
          700: '#1d5532',
          800: '#1a442a',
          900: '#163825',
          950: '#0a2015',
        },
        river: {
          50: '#eefbfb',
          100: '#d3f3f4',
          200: '#ace7ea',
          300: '#73d4da',
          400: '#38b8c2',
          500: '#1c9aa6',
          600: '#197c8b',
          700: '#1a6472',
          800: '#1c525e',
          900: '#1b4550',
        },
        sun: {
          400: '#f5b544',
          500: '#eea01f',
          600: '#d98014',
        },
        earth: {
          400: '#c58d5f',
          500: '#a86f43',
          600: '#8a5836',
        },
      },
      fontFamily: {
        display: ['"Poppins"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'drift-slow': {
          '0%': { transform: 'translate(0,0)' },
          '50%': { transform: 'translate(-18px,10px)' },
          '100%': { transform: 'translate(0,0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        float: 'float 6s ease-in-out infinite',
        'drift-slow': 'drift-slow 18s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
