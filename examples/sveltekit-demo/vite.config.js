import path from 'path'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { stylexPlugin } from 'vite-plugin-stylex-dev'

export default defineConfig({
  plugins: [sveltekit(), stylexPlugin({ include: /\.(mjs|js|ts|vue|jsx|tsx|svelte)(\?.*|)$/ })],
  server: {
    fs: {
      allow: [path.resolve('../../../kit')]
    }
  }
})
