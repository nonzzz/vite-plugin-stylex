import { defineConfig } from 'vite'
import { qwikVite } from '@builder.io/qwik/optimizer'
import { qwikCity } from '@builder.io/qwik-city/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { stylex } from 'vite-plugin-stylex-dev'

export default defineConfig(() => {
  return {
    plugins: [qwikCity(), qwikVite(), tsconfigPaths({ root: __dirname }), stylex()],
    dev: {
      headers: {
        'Cache-Control': 'public, max-age=0'
      }
    },
    preview: {
      headers: {
        'Cache-Control': 'public, max-age=600'
      }
    }
  }
})
