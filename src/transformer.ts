import { transformAsync } from '@babel/core'
import stylexBabelPlugin from '@stylexjs/babel-plugin'
import type { StylexPluginOptions } from './interface'
import type { Env } from './context'

export interface TransformOptions<T> {
  filename: string
  options: T
  env: Env
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

export function transformStylexExtend() {}
