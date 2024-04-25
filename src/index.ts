import type { Plugin } from 'vite'
import { stylexDev, stylexProd } from './server'
import type { StylexPluginOptions } from './interface'

function stylex(opts: StylexPluginOptions): Plugin {
  if (process.env.NODE_ENV === 'production') return stylexProd(opts)
  return stylexDev(opts)
}

/**
 * @deprecated will be remove in next major version
 */
const stylexPlugin = stylex

export { stylex, stylexPlugin, stylex as edfault }
