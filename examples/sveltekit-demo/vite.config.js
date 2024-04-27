import path from 'path'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { stylex } from 'vite-plugin-stylex-dev'

export default defineConfig({
  plugins: [sveltekit(), stylex({ include: /\.(mjs|js|ts|vue|jsx|tsx|svelte)(\?.*|)$/ })],
  server: {
    fs: {
      allow: [path.resolve('../../../kit')]
    }
  }
})
