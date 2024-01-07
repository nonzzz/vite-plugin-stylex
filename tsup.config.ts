import type { Options } from 'tsup'

export const tsup: Options = {
  entry: ['src/index.ts'],
  dts: true,
  format: ['cjs', 'esm'],
  splitting: true,
  clean: true,
  shims: false,
  // minify: true,
  external: ['@rollup/pluginutils', 'vite']
}
