import { transformAsync } from '@babel/core'
import stylexBabelPlugin, { Rule } from '@stylexjs/babel-plugin'
import type { Plugin } from 'vite'
import type { StylexPluginOptions } from '../interface'
import { parseURLRequest } from '../manually-order'
import { createStateContext } from './state-context'

type BabelConfig = StylexPluginOptions['babelConfig']

const defaultBabelConfig: BabelConfig = {
  plugins: [],
  presets: []
}

export const stateContext = createStateContext()

export const DEFINE = {
  MODULE_ID: '\0stylex-dev',
  MODULE_CSS: '@stylex-dev.css',
  HIJACK_PLUGINS: ['vite:css', 'vite:csspost']
}

export function stylex(opts: StylexPluginOptions = {}): Plugin {
  const {
    useCSSLayers = false,
    babelConfig = defaultBabelConfig,
    importSources = ['stylex', '@stylexjs/stylex'],
    include = /\.(mjs|js|ts|vue|jsx|tsx)(\?.*|)$/,
    exclude,
    // eslint-disable-next-line no-unused-vars
    optimizedDeps: _ = [],
    manuallyControlCssOrder = false,
    ...options
  } = opts

  stateContext.setupOptions({ useCSSLayers, importSources, include, exclude, manuallyControlCssOrder })

  return {
    name: 'stylex',
    buildStart() {
      stateContext.styleRules.clear()
    },
    shouldTransformCachedModule({ id, meta }) {
      stateContext.styleRules.set(id, meta.stylexRules)
      return false
    },
    async transform(code, id) {
      stateContext.setupPluginContext(this)
      if (!stateContext.skipResolve(code, id)) return
      id = parseURLRequest(id).original
      console.log(id)
      code = await stateContext.rewriteImportStmts(code, id)
      const result = await transformAsync(code, {
        babelrc: false,
        filename: id,
        presets: babelConfig?.presets || [],
        plugins: [...[babelConfig?.plugins || []], stylexBabelPlugin.withOptions({ 
          ...options,
          dev: stateContext.env === 'dev',
          importSources,
          runtimeInjection: false
        })]
      })
      if (!result) return null
      if (result.metadata && 'stylex' in result.metadata) {
        const rules = result.metadata.stylex as Rule[]
        if (rules.length) {
          stateContext.styleRules.set(id, rules)
        }
      }
      return {
        code: result.code!,
        map: result.map,
        meta: result.metadata
      }
    },
    closeBundle() {
      stateContext.destroy()
    }
  }
}

export type StylexFunction = typeof stylex
