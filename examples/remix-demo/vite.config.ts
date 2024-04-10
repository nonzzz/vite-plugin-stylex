import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { stylexPlugin } from 'vite-plugin-stylex-dev'

export default defineConfig({
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      drafts: {
        customMedia: true
      }
    }
  },
  plugins: [remix(), tsconfigPaths(), stylexPlugin()]
})
