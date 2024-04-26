import { defineConfig } from 'vite'
import { qwikVite } from '@builder.io/qwik/optimizer'
import { qwikCity } from '@builder.io/qwik-city/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { stylex } from 'vite-plugin-stylex-dev'

export default defineConfig({
  plugins: [qwikCity(), qwikVite(), tsconfigPaths(), stylex()],
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=600'
    }
  },
  mode: 'ssr',
  logLevel: 'silent'

})
