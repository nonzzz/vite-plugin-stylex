import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { stylex } from 'vite-plugin-stylex-dev'

export default defineConfig({
  plugins: [remix(), tsconfigPaths(), stylex()],
  logLevel: 'silent'
})
