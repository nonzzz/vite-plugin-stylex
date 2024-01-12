import civetPlugin from '@danielx/civet/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { stylexPlugin } from 'vite-plugin-stylex-dev'

export default defineConfig({
  // Fixme @stylexjs/stylex don't respect `runtimeInjection` so we should set `dev` as false
  plugins: [civetPlugin({}), react(), stylexPlugin({ include: /\.(mjs|js|ts|civet|jsx|tsx)(\?.*|)$/, dev: false })]
})
