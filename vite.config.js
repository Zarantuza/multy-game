import { defineConfig } from 'vite'

export default defineConfig({
  base: '/multy-game/', // Replace 'speedoku' with your repository name
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
  },
})