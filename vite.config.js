import { defineConfig } from 'vite'

export default defineConfig({
  base: '/multy-game/',
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
  },
})