import { fileURLToPath } from 'url'
import path from 'path'
import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
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
  plugins: [remix(), tsconfigPaths(), stylex(
    {
      manuallyControlCssOrder: {
        id: path.join(path.dirname(fileURLToPath(import.meta.url)), 'app/styles/index.css')
      }
    }
  )]
})
