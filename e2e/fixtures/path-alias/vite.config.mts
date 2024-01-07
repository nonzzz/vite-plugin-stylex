import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { stylexPlugin } from 'vite-plugin-stylex-dev'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src')
    }
  },
  plugins: [react(), stylexPlugin()]
})
