import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import { stylex } from 'vite-plugin-stylex-dev'

export default defineConfig({
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      drafts: {
        customMedia: true
      }
    }
  },
  plugins: [
    remix(),
    stylex({ enableStylexExtend: true })
  ]
})
