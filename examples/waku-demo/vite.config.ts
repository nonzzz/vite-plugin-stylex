import { defineConfig } from 'vite'

import { stylexPlugin } from 'vite-plugin-stylex-dev'

export default defineConfig({
  ssr: {
    external: ['@stylexjs/stylex']
  },
  plugins: [stylexPlugin()]
})
