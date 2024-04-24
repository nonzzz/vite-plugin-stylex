// Notice is use for vite
import type { Plugin, ViteDevServer } from 'vite'
import { DEFINE, stateContext, stylex } from '../core'
import { searchForWorkspaceRoot } from '../shared'
import type { StylexPluginOptions } from '../interface'
import { hijackHook } from './hijack'

const WELL_KNOW_LIBRARIES = ['@stylexjs/open-props']

function csr() {}

function ssr() {}

export function stylexDev(opts: StylexPluginOptions = {}): Plugin {
  const hooks = stylex(opts)
  let viteDevServer: ViteDevServer | null = null
  const viteCSSPlugins: Plugin[] = []

  hijackHook(hooks, 'transform', async (fn, context, args) => {
    const result = await fn.apply(context, args)
    if (typeof result === 'object' && result?.code) {
      const { code } = result
    }
  })

  return {
    ...hooks,
    configResolved(config) {
      stateContext.env = 'dev'
      const root = searchForWorkspaceRoot(config.root)
      if (!opts.unstable_moduleResolution) {
        opts.unstable_moduleResolution = { type: 'commonJS', rootDir: root }
      }
      opts.optimizedDeps = Array.isArray(opts.optimizedDeps)
        ? [...opts.optimizedDeps, ...stateContext.importSources.map(s => typeof s === 'object' ? s.from : s)]
        : []
      config.optimizeDeps.exclude = [...opts.optimizedDeps, ...(config.optimizeDeps.exclude ?? []), ...WELL_KNOW_LIBRARIES]
      viteCSSPlugins.push(...config.plugins.filter(p => DEFINE.HIJACK_PLUGINS.includes(p.name)))
      viteCSSPlugins.sort((a) => a.name === 'vite:css' ? 1 : -1)
    },
    configureServer(server) {
      viteDevServer = server
    }
  }
}
