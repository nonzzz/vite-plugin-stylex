import type { FilterPattern, HookHandler, Plugin } from 'vite'
import type { Options } from '@stylexjs/babel-plugin'
import type { PluginItem } from '@babel/core'
import type { StylexExtendBabelPluginOptions } from '@stylex-extend/babel-plugin'
import { noop } from './shared'

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
}

export type InternalOptions = Mutable<Omit<Options, 'dev' | 'runtimeInjection' | 'aliases'>>

export type StylexOptions = Partial<Mutable<Options>>

export type StylexExtendOptions = Omit<StylexExtendBabelPluginOptions, 'unstable_moduleResolution' | 'classNamePrefix'>

export interface ManuallyControlCssOrder {
  id?: string
  symbol?: string
}

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
  /**
   * @experimental
   */
  manuallyControlCssOrder?: boolean | ManuallyControlCssOrder
  /**
   * @experimental
   */
  enableStylexExtend?: boolean | StylexExtendOptions
  [prop: string]: unknown
}

export type TransformStylexOptions = Partial<InternalOptions > & {
  plugins: Array<PluginItem>
  presets: Array<PluginItem>
  dev: boolean
}

const transform: HookHandler<Plugin['transform']> = noop

export type RollupPluginContext = ThisParameterType<typeof transform>
