import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// `base` é '/' por padrão (Vercel, local). No GitHub Pages o site fica em
// https://<usuario>.github.io/<repo>/, então o workflow define VITE_BASE=/<repo>/.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})
