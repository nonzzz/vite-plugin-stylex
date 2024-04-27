import { defineConfig } from 'astro/config'
import { stylex } from 'vite-plugin-stylex-dev'

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [stylex({ include: /\.(mjs|js|ts|vue|jsx|tsx|astro)(\?.*|)$/ })]
  }
})
