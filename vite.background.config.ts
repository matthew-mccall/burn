import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: false,
    lib: {
      formats: ['iife'],
      entry: './src/background.ts',
      name: 'background',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'background.js',
        extend: true,
      }
    }
  }
})
