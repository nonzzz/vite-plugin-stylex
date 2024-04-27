import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Inspect from 'vite-plugin-inspect'
import { stylex } from 'vite-plugin-stylex-dev'

export default defineConfig({
  plugins: [vue(), stylex(), Inspect({ dev: true })]
})
