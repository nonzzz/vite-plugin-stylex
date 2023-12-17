import { unstable_vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { stylexPlugin } from 'vite-plugin-stylex'

export default defineConfig({
  plugins: [remix(), tsconfigPaths(), stylexPlugin()],
  logLevel: 'silent'
})
