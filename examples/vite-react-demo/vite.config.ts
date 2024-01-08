// import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { stylexPlugin } from 'vite-plugin-stylex-dev'

export default defineConfig({
  // resolve: {
  //   alias: {
  //     '@': path.join(__dirname, 'src'),
  //     '~': path.join(__dirname, 'themes')
  //   }
  // },
  plugins: [tsconfigPaths({ root: __dirname }), react(), stylexPlugin()]
})
