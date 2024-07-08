import type { HookHandler, Plugin } from 'vite'
import { PluginContext } from '../context'
import { error, hijackHook, searchForPackageRoot, unique } from '../shared'
import type { AdapterOptions } from '../interface'
import { stylexBuild } from './build'
import { CONSTANTS, stylexServer } from './server'
import type { CssHooks } from './server'

export function createForViteServer(ctx: PluginContext, extend: (c: PluginContext) => Plugin) {
  const cssPlugins: Plugin[] = []
  const cssHooks: CssHooks = new Map()

  return (plugin: Plugin) => {
    plugin.configResolved = function configResolved(conf) {
      const adapterOptions: AdapterOptions = {
        transform: plugin.transform as HookHandler<Plugin['transform']>,
        vite: { cssPlugins, config: conf },
        context: ctx
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

      conf.plugins.forEach(p => {
        if (CONSTANTS.CSS_PLUGINS.includes(p.name)) {
          cssHooks.set(p.name, hijackHook(p, 'transform', (fn, c, args) => fn.apply(c, args), true))
        }
      })

      const pos = conf.plugins.findIndex(p => p.name === 'stylex')
      if (Object.keys(ctx.stylexExtendOptions).length) {
        // @ts-expect-error
        conf.plugins.splice(pos, 0, extend(ctx))
      }
      ctx.env === 'build'
        ? stylexBuild(plugin, { ctx, cssHooks, config: conf })
        : stylexServer(plugin, { ctx, cssHooks, config: conf })
      if (typeof ctx.stylexOptions.adapter === 'function') {
        const adapter = ctx.stylexOptions.adapter()
        if (!adapter.name) {
          throw error('adapter missing name.')
        }
        adapter.setup(plugin, adapterOptions)
      }
    }
  }
}
