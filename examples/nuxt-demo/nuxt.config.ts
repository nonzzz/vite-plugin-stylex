import { stylex } from 'vite-plugin-stylex-dev'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  vite: {
    plugins: [stylex()]
  }
})
