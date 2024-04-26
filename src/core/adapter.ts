import type { Plugin } from 'rollup'
import type { StylexPluginOptions } from '../interface'
import type { StylexFunction } from './base'
import { StateContext } from './state-context'

export interface StylexAdapterPluginOptions extends StylexPluginOptions {
  fileName?: string
}
 
export function adapter(plugin: StylexFunction, options: StylexAdapterPluginOptions = {}) {
  const { fileName = 'stylex.css', ...rest } = options
  const { api, ...hooks } = plugin(rest)
  const context = api.stateContext as StateContext
  return <Plugin>{ 
    ...hooks,
    generateBundle() {
      this.emitFile({ fileName, source: context.processCSS(), type: 'asset' })
    } 
  }
}
