// import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { stylex } from 'vite-plugin-stylex-dev'
import rsdPlugin from 'react-strict-dom/babel'

export default defineConfig({
  // resolve: {
  //   alias: {
  //     '@': path.join(__dirname, 'src'),
  //     '~': path.join(__dirname, 'themes')
  //   }
  // },
  plugins: [tsconfigPaths({ root: __dirname }), react(), 
    stylex(
      { babelConfig: {
        plugins: [rsdPlugin]
      },
      importSources: [
        '@stylexjs/stylex',
        'stylex',
        { from: 'react-strict-dom', as: 'css' }
      ],
      styleResolution: 'property-specificity',
      enableStylexExtend: true
      }
    )]
})
