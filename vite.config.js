import { defineConfig } from 'vite'

export default defineConfig({
  base: '/multy-game/', // Replace with your actual repository name
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
  },
})