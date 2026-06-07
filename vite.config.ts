import { defineConfig } from 'vite'

export default defineConfig({
  base: '/the-maw/',
  build: {
    target: 'es2020',
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
