import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { stylexPlugin } from 'vite-plugin-stylex'

export default defineConfig({
  plugins: [vue(), stylexPlugin()]
})
