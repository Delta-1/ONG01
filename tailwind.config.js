/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta principal (temável): dirigida por variáveis CSS para permitir
        // troca de tema global em tempo real. Os valores padrão (tema "floresta")
        // ficam em src/styles/index.css.
        forest: {
          50: 'rgb(var(--c-forest-50) / <alpha-value>)',
          100: 'rgb(var(--c-forest-100) / <alpha-value>)',
          200: 'rgb(var(--c-forest-200) / <alpha-value>)',
          300: 'rgb(var(--c-forest-300) / <alpha-value>)',
          400: 'rgb(var(--c-forest-400) / <alpha-value>)',
          500: 'rgb(var(--c-forest-500) / <alpha-value>)',
          600: 'rgb(var(--c-forest-600) / <alpha-value>)',
          700: 'rgb(var(--c-forest-700) / <alpha-value>)',
          800: 'rgb(var(--c-forest-800) / <alpha-value>)',
          900: 'rgb(var(--c-forest-900) / <alpha-value>)',
          950: 'rgb(var(--c-forest-950) / <alpha-value>)',
        },
        // Acento (temável)
        sun: {
          400: 'rgb(var(--c-sun-400) / <alpha-value>)',
          500: 'rgb(var(--c-sun-500) / <alpha-value>)',
          600: 'rgb(var(--c-sun-600) / <alpha-value>)',
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
        earth: { 400: '#c58d5f', 500: '#a86f43', 600: '#8a5836' },
        // Base editorial (papel + tinta), estilo acadêmico
        paper: '#f6f4ee',
        ink: '#14261c',
      },
      fontFamily: {
        // Títulos com serifa (ar acadêmico); interface em sans
        display: ['"Source Serif 4"', 'Georgia', 'Cambria', 'serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(3deg)' },
        },
        'drift-slow': {
          '0%': { transform: 'translate(0,0)' },
          '50%': { transform: 'translate(-18px,10px)' },
          '100%': { transform: 'translate(0,0)' },
        },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        sway: {
          '0%,100%': { transform: 'rotate(-6deg)' },
          '50%': { transform: 'rotate(6deg)' },
        },
        // Entrada de página: leve fade + deslize pra cima (troca de aba fluida)
        'page-in': {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.995)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        float: 'float 6s ease-in-out infinite',
        'drift-slow': 'drift-slow 18s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out both',
        sway: 'sway 5s ease-in-out infinite',
        'page-in': 'page-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
