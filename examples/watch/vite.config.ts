import path from 'path'
import { defineConfig } from 'vite'
import { stylex } from 'vite-plugin-stylex-dev'

export default defineConfig({
  plugins: [stylex({ manuallyControlCssOrder: {
    id: path.join(__dirname, 'src/stylex.css')
  }
  })],
  build: {
    outDir: 'dist',
    lib: {
      entry: 'src/index.ts',
      name: 'main'
    }
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      drafts: {
        customMedia: true
      }
    }
  }
})
