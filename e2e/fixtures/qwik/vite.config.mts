import { defineConfig } from 'vite'
import { qwikVite } from '@builder.io/qwik/optimizer'
import { qwikCity } from '@builder.io/qwik-city/vite'
import { stylex } from 'vite-plugin-stylex-dev'

export default defineConfig(() => {
  return {
    plugins: [qwikCity(), qwikVite(), stylex({ enableStylexExtend: true })],
    dev: {
      headers: {
        'Cache-Control': 'public, max-age=0'
      }
    }
  }
})
