import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/multy-game/',
  build: {
    emptyOutDir: true,
  },
  server: {
    port: 3000
  },
})