import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Inspect from 'vite-plugin-inspect'
import { stylexPlugin } from 'vite-plugin-stylex-dev'

export default defineConfig({
  plugins: [vue(), stylexPlugin(), Inspect({ dev: true })]
})
