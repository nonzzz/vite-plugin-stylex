import { defineConfig } from 'vite'
import { stylex } from 'vite-plugin-stylex-dev'
import { waku } from 'vite-plugin-stylex-dev/adapter'

export default defineConfig({
  ssr: {
    external: ['@stylexjs/stylex']
  },
  plugins: [stylex({ adapter: waku })]
})
