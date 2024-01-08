import { defineConfig } from 'astro/config'
import { stylexPlugin } from 'vite-plugin-stylex-dev'

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [stylexPlugin({ include: /\.(mjs|js|ts|vue|jsx|tsx|astro)(\?.*|)$/ })]
  }
})
