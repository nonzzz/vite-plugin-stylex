import type { FilterPattern, HookHandler, Plugin } from 'vite'
import type { Options } from '@stylexjs/babel-plugin'
import type { PluginItem } from '@babel/core'

export type InternalOptions = Omit<Options, 'dev' | 'runtimeInjection' | 'aliases'>

export interface StylexPluginOptions extends Partial<InternalOptions> {
  babelConfig?: {
    plugins?: Array<PluginItem>
    presets?: Array<PluginItem>
  },
  useCSSLayers?: boolean,
  include?: FilterPattern
  exclude?: FilterPattern
  /**
   * @experimental
   */
  optimizedDeps?: Array<string>
  [prop: string]: unknown
}

export type TransformStylexOptions = Partial<InternalOptions > & {
  plugins: Array<PluginItem>
  presets: Array<PluginItem>
  dev: boolean
}

export type RollupPluginContext = ThisParameterType<HookHandler<Plugin['transform']>>
