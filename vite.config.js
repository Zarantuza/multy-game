import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/multy-game/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      external: ['peerjs']
    },
  },
  server: {
    port: 3000
  },
})