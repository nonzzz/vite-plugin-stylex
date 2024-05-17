import { fileURLToPath } from 'url'
import path from 'path'
import { defineConfig } from 'rollup'
import { swc } from 'rollup-plugin-swc3'
import { adapter, stylex } from 'vite-plugin-stylex-dev'

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.mjs', format: 'esm', exports: 'named' },
      { file: 'dist/index.js', format: 'cjs', exports: 'named' }
    ],
    plugins: [
      swc(),
      adapter(stylex, { enableStylexExtend: false,
        unstable_moduleResolution: {
          rootDir: path.dirname(fileURLToPath(import.meta.url)),
          type: 'commonJS'
        }
      })
    ]
  }
])
