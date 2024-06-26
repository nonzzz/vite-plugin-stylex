import type { Plugin } from 'vite'
import { PluginContext } from '../context'
import { error, searchForPackageRoot, unique } from '../shared'
import type { AdapterContext } from '../interface'
import { stylexBuild } from './build'
import { CONSTANTS, stylexServer } from './server'

export function createForViteServer(ctx: PluginContext, extend: (c: PluginContext) => Plugin) {
  const cssPlugins: Plugin[] = []

  return (plugin: Plugin) => {
    plugin.configResolved = function configResolved(conf) {
      const adapterContext: AdapterContext = {
        // eslint-disable-next-line prefer-spread
        produceCSS: (...rest: any) => ctx.produceCSS.apply(ctx, rest),
        transform: plugin.transform as any,
        vite: { cssPlugins, config: conf },
        env: ctx.env,
        rules: ctx.styleRules,
        useCSSLayers: ctx.stylexOptions.useCSSLayers ?? false
      }

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
      const pos = conf.plugins.findIndex(p => p.name === 'stylex')
      if (Object.keys(ctx.stylexExtendOptions).length) {
        // @ts-expect-error
        conf.plugins.splice(pos, 0, extend(ctx))
      }
      ctx.env === 'build' ? stylexBuild(plugin, ctx, cssPlugins) : stylexServer(plugin, ctx, cssPlugins, conf)
      if (typeof ctx.stylexOptions.adapter === 'function') {
        const adapter = ctx.stylexOptions.adapter()
        if (!adapter.name) {
          throw error('adapter missing name.')
        }
        adapter.setup(adapterContext, plugin)
      }
    }
  }
}
