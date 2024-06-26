import type { FilterPattern, HookHandler, Plugin, ResolvedConfig } from 'vite'
import type { Options, Rule } from '@stylexjs/babel-plugin'
import type { PluginItem } from '@babel/core'
import type { StylexExtendBabelPluginOptions } from '@stylex-extend/babel-plugin'
import { noop } from './shared'
import type { Env, PluginContext } from './context'

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

interface AdapterViteOptions {
  cssPlugins: Plugin[]
  config: ResolvedConfig
}
export interface AdapterContext {
  env: Env
  vite: AdapterViteOptions
  rules: PluginContext['styleRules']
  produceCSS: (input?: Map<string, Rule[]>) => string
  transform: HookHandler<Plugin['transform']>
}

export interface AdapterConfig {
  name: string
  setup: (ctx: AdapterContext, plugin: Plugin) => void
}

export type Pretty<T> =
  & {
    [key in keyof T]: T[key] extends (...args: any[]) => any ? (...args: Parameters<T[key]>) => ReturnType<T[key]>
      : T[key] & NonNullable<unknown>
  }
  & NonNullable<unknown>

export type InternalOptions = Mutable<Omit<Options, 'dev' | 'runtimeInjection' | 'aliases'>>

export type StylexOptions = Partial<Mutable<Options>>

export type StylexExtendOptions = Omit<StylexExtendBabelPluginOptions, 'unstable_moduleResolution' | 'classNamePrefix'>

export interface ManuallyControlCssOrder {
  id?: string
  symbol?: string
}

interface InternalStylexPluginOptions extends Partial<InternalOptions> {
  babelConfig?: {
    plugins?: Array<PluginItem>
    presets?: Array<PluginItem>
  }
  useCSSLayers?: boolean
  include?: FilterPattern
  exclude?: FilterPattern
  /**
   * @experimental
   */
  optimizedDeps?: Array<string>
  /**
   * @experimental
   */
  manuallyControlCssOrder?: boolean | ManuallyControlCssOrder
  /**
   * @experimental
   */
  enableStylexExtend?: boolean | StylexExtendOptions
  /**
   * @experimental
   */
  adapter?: () => AdapterConfig
  [prop: string]: unknown
}

export type StylexPluginOptions = Pretty<InternalStylexPluginOptions>

export type TransformStylexOptions = Partial<InternalOptions> & {
  plugins: Array<PluginItem>
  presets: Array<PluginItem>
  dev: boolean
}

const transform: HookHandler<Plugin['transform']> = noop

export type RollupPluginContext = ThisParameterType<typeof transform>
