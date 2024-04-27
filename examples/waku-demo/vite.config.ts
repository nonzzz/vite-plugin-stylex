import { defineConfig } from 'vite'

import { stylex } from 'vite-plugin-stylex-dev'

export default defineConfig({
  ssr: {
    external: ['@stylexjs/stylex']
  },
  plugins: [stylex()]
})
