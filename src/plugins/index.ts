import type { Plugin } from 'vite'
import { PluginContext } from '../context'
import { searchForPackageRoot, unique } from '../shared'
import { stylexBuild } from './build'
import { CONSTANTS, stylexServer } from './server'

export function createForViteServer(ctx: PluginContext) {
  const cssPlugins: Plugin[] = []
  return (plugin: Plugin) => {
    plugin.configResolved = function configResolved(conf) {
      ctx.env = conf.command === 'serve' ? 'server' : 'build'
      ctx.root = searchForPackageRoot(conf.root)
      const { importSources, stylexOptions } = ctx
      if (!stylexOptions.unstable_moduleResolution) {
        stylexOptions.unstable_moduleResolution = { type: 'commonJS', rootDir: ctx.root }
      }

      const optimizedDeps = unique([
        ...Array.isArray(ctx.stylexOptions.optimizedDeps) ? ctx.stylexOptions.optimizedDeps : [],
        ...importSources.map((s: any) => typeof s === 'object' ? s.from : s),
        ...CONSTANTS.WELL_KNOW_LIBRARIES
      ])

      if (ctx.env === 'server') {
        conf.optimizeDeps.exclude = [...optimizedDeps, ...(conf.optimizeDeps.exclude ?? [])]
      }
      if (conf.appType === 'custom') {
        conf.ssr.noExternal = Array.isArray(conf.ssr.noExternal)
          ? [...conf.ssr.noExternal, ...optimizedDeps]
          : conf.ssr.noExternal
      }
      cssPlugins.push(...conf.plugins.filter(p => CONSTANTS.CSS_PLUGINS.includes(p.name)))
      cssPlugins.sort((a, b) => a.name.length < b.name.length ? -1 : 1)
    }
    ctx.env === 'build' ? stylexBuild(plugin, ctx, cssPlugins) : stylexServer(plugin, ctx)
  }
}
