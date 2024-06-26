import { transformAsync } from '@babel/core'
import stylexBabelPlugin from '@stylexjs/babel-plugin'
import _stylexExtendBabelPlugin from '@stylex-extend/babel-plugin'
import type { StylexExtendBabelPluginOptions } from '@stylex-extend/babel-plugin'
import type { StylexPluginOptions } from './interface'
import type { Env } from './context'

function interopDefault(m: any) {
  return m.default || m
}

const stylexExtendBabelPlugin = interopDefault(_stylexExtendBabelPlugin)

export interface TransformOptions<T> {
  filename: string
  options: T
  env: Env
}

export interface TransformExtendOptions {
  opts: StylexExtendBabelPluginOptions
  parserOptions: any[]
}

export async function transformStylex(code: string, { filename, options, env }: TransformOptions<StylexPluginOptions>) {
  const { babelConfig, importSources } = options
  return transformAsync(code, {
    babelrc: false,
    filename,
    presets: [],
    plugins: [
      ...(babelConfig?.plugins || []),
      stylexBabelPlugin.withOptions({
        ...options,
        dev: env === 'server',
        runtimeInjection: false,
        importSources
      })
    ]
  })
}

export function transformStylexExtend(code: string, { filename, options }: TransformOptions<TransformExtendOptions>) {
  const { opts, parserOptions } = options
  return transformAsync(code, {
    plugins: [stylexExtendBabelPlugin.withOptions(opts)],
    parserOpts: { plugins: parserOptions },
    babelrc: false,
    filename
  })
}
