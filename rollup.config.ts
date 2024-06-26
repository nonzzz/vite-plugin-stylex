import { builtinModules, createRequire } from 'module'
import { defineConfig } from 'rollup'
import dts from 'rollup-plugin-dts'
import { swc } from 'rollup-plugin-swc3'

const _require = createRequire(import.meta.url)
const { dependencies } = _require('./package.json')

const external = [...Object.keys(dependencies), ...builtinModules]

export default defineConfig([
  {
    input: 'src/index.ts',
    external,
    output: [
      { file: 'dist/index.mjs', format: 'esm', exports: 'named' },
      { file: 'dist/index.js', format: 'cjs', exports: 'named' }
    ],
    plugins: [
      swc()
    ]
  },
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.d.ts' },
    plugins: [dts({})]
  },
  {
    input: 'src/adapter/index.ts',
    external,
    output: [
      { file: 'dist/adapter/index.mjs', format: 'esm', exports: 'named' },
      { file: 'dist/adapter/index.js', format: 'cjs', exports: 'named' }
    ],
    plugins: [
      swc()
    ]
  },
  {
    input: 'src/adapter/index.ts',
    output: { file: 'dist/adapter/index.d.ts' },
    plugins: [dts({})]
  }
])
