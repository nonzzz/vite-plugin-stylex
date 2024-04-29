import { fileURLToPath } from 'url'
import path from 'path'
import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { stylex } from 'vite-plugin-stylex-dev'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      drafts: {
        customMedia: true
      }
    }
  },
  plugins: [remix(), tsconfigPaths({ root: __dirname }), stylex(
    {
      manuallyControlCssOrder: {
        id: path.join(__dirname, 'app/styles/index.css')
      }
    }
  )]
})
