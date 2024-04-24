// Adapter for rollup
// import { adapter } from 'vite-plugin-stylex-dev/adapter';
// import { stylex } from 'vite-plugin-stylex-dev'
// Usage:
//  adapter(stylex,{})
import type { Plugin } from 'rollup'
import type { StylexPluginOptions } from '../interface'
import type { StylexFunction } from './base'
 
export function adapter(plugin: StylexFunction, options: StylexPluginOptions = {}): Plugin {
  return plugin(options)
}
