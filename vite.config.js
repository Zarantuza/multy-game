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
      // Remove the external: ['peerjs'] line
    },
  },
  server: {
    port: 3000
  },
})