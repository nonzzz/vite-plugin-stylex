import { defineConfig } from 'vite'

import { stylex } from 'vite-plugin-stylex-dev'
import { waku } from 'vite-plugin-stylex-dev/adapter'

// import { stylex as classicStylex } from 'vite-plugin-stylex-dev-classic'

export default defineConfig({
  ssr: {
    external: ['@stylexjs/stylex']
  },
  // plugins: [classicStylex()]
  plugins: [stylex({ adapter: waku })]
})
