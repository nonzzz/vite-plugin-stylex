import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { stylex } from 'vite-plugin-stylex-dev'

export default defineConfig({
  plugins: [vue(), stylex()]
})
