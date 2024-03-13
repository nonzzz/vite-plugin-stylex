import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import commonjs from 'vite-plugin-commonjs'

import { stylexPlugin } from 'vite-plugin-stylex-dev'

export default defineConfig({
  plugins: [vue(), stylexPlugin(), commonjs()]
})
