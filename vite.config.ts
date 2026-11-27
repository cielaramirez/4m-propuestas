import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base relativa: la demo se publica en una subcarpeta de GitHub Pages
export default defineConfig({
  base: './',
  plugins: [react()],
})
