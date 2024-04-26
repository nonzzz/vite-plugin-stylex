import path from 'path'
import type { Plugin } from 'vite'
import { DEFINE, stylex as _stylex } from './core'
import { stylexDev, stylexProd } from './server'
import { StateContext } from './core/state-context'
import type { StylexPluginOptions } from './interface'
import { searchForPackageRoot, slash, unique } from './shared'
import { WELL_KNOW_LIBRARIES } from './core/approve'

function stylex(opts: StylexPluginOptions = {}) {
  const { api, ...hooks } = _stylex(opts)
  const context = api.stateContext as StateContext
  const viteCSSPlugins: Plugin[] = []
  const plugin = <Plugin>{ 
    ...hooks,
    configResolved(conf) {
      context.env = process.env.NODE_ENV === 'development'
        ? 'dev'
        : 'prod'

      const root = searchForPackageRoot(conf.root)
      const { stylexOptions, importSources } = context
      if (!stylexOptions.unstable_moduleResolution) {
        stylexOptions.unstable_moduleResolution = { type: 'commonJS', rootDir: root }
      }

      viteCSSPlugins.push(...conf.plugins.filter(p => DEFINE.HIJACK_PLUGINS.includes(p.name)))
      viteCSSPlugins.sort((a, b) => a.name.length < b.name.length ? -1 : 1)

      const optimizedDeps = unique([...(Array.isArray(opts.optimizedDeps) ? opts.optimizedDeps : []),
        ...importSources.map(s => typeof s === 'object' ? s.from : s), ...WELL_KNOW_LIBRARIES])
      
      if (context.env === 'dev') {
        conf.optimizeDeps.exclude = [...optimizedDeps, ...(conf.optimizeDeps.exclude ?? [])]
        stylexDev(plugin, context, viteCSSPlugins)
      } else {
        stylexProd(plugin, context, viteCSSPlugins)
      }
      
      if (conf.appType === 'custom') {
        conf.ssr.noExternal = Array.isArray(conf.ssr.noExternal)
          ? [...conf.ssr.noExternal, ...optimizedDeps]
          : conf.ssr.noExternal
      }
    
      if (context.controlCSSByManually.id) {
        context.controlCSSByManually.id = path.isAbsolute(context.controlCSSByManually.id)
          ? context.controlCSSByManually.id
          : path.join(root, context.controlCSSByManually.id)
        context.controlCSSByManually.id = slash(context.controlCSSByManually.id)
      }
    }
  }

  return plugin
}

/**
 * @deprecated will be remove in next major version
 */
const stylexPlugin = stylex

export { stylex, stylexPlugin, stylex as edfault }

export type { StylexPluginOptions } from './interface'

export { adapter } from './core'
