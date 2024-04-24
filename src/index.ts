import type { Plugin } from 'vite'
import { stylexDev, stylexProd } from './server'
import type { StylexPluginOptions } from './interface'

function stylex(opts: StylexPluginOptions): Plugin[] {
  return [{ ...stylexDev(opts), apply: 'serve' }, { ...stylexProd(), apply: 'build' }]
}

/**
 * @deprecated will be remove in next major version
 */
const stylexPlugin = stylex

export { stylex, stylexPlugin, stylex as edfault }
