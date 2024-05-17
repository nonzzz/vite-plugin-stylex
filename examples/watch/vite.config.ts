import { defineConfig } from 'vite'
import { stylex } from 'vite-plugin-stylex-dev'

export default defineConfig({
  plugins: [stylex()],
  build: {
    outDir: 'dist',
    lib: {
      entry: 'src/index.ts',
      name: 'main'
    }
  }
})
