import path from 'path'
import fs from 'fs'
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import { parseURLRequest } from '../core/manually-order'
import { DEFINE, stateContext, stylex } from '../core'
import { searchForWorkspaceRoot, slash, unique } from '../shared'
import type { StylexPluginOptions } from '../interface'
import { hijackHook } from './hijack'

const fsp = fs.promises

const WELL_KNOW_LIBRARIES = ['@stylexjs/open-props']

function csr(config: ResolvedConfig) {
  // 
}

function ssr(config: ResolvedConfig) {
  // 
}

export function stylexDev(opts: StylexPluginOptions = {}): Plugin {
  const hooks = stylex(opts)
  let viteDevServer: ViteDevServer | null = null
  const viteCSSPlugins: Plugin[] = []

  hijackHook(hooks, 'transform', async (fn, context, args) => {
    const result = await fn.apply(context, args)
    if (typeof result === 'object' && result) {
      // eslint-disable-next-line no-unused-vars
      const [_, id] = args
      let { code } = result
      if (stateContext.styleRules.has(id)) {
        if (!stateContext.isManuallyControlCSS) {
          code = `import ${JSON.stringify(DEFINE.MODULE_ID)};\n${code}`
        }
      }

      if (viteDevServer) {
        const module = viteDevServer.moduleGraph.getModuleById(DEFINE.MODULE_CSS)
        if (module) viteDevServer.moduleGraph.invalidateModule(module)
        if (stateContext.isManuallyControlCSS) {
          const cssModule = viteDevServer.moduleGraph.getModuleById(stateContext.controlCSSByManually.id!)
          if (cssModule) viteDevServer.reloadModule(cssModule)
        }
      }

      return { ...result, code }
    }
  })

  return {
    ...hooks,
    load(id) {
      if (id === DEFINE.MODULE_CSS) return stateContext.processCSS()
    },
    resolveId(id) {
      if (id === DEFINE.MODULE_ID) return DEFINE.MODULE_CSS
    },
    configResolved(config) {
      stateContext.env = 'dev'
      const root = searchForWorkspaceRoot(config.root)
      const { stylexOptions, importSources } = stateContext
      if (!stylexOptions.unstable_moduleResolution) {
        stylexOptions.unstable_moduleResolution = { type: 'commonJS', rootDir: root }
      }
      const optimizedDeps = unique([...(Array.isArray(opts.optimizedDeps) ? opts.optimizedDeps : []), ...importSources.map(s => typeof s === 'object' ? s.from : s)])
      config.optimizeDeps.exclude = [...optimizedDeps, ...(config.optimizeDeps.exclude ?? []), ...WELL_KNOW_LIBRARIES]
      viteCSSPlugins.push(...config.plugins.filter(p => DEFINE.HIJACK_PLUGINS.includes(p.name)))
      viteCSSPlugins.sort((a) => a.name === 'vite:css' ? 1 : -1)
      if (stateContext.controlCSSByManually.id) {
        stateContext.controlCSSByManually.id = path.isAbsolute(stateContext.controlCSSByManually.id)
          ? stateContext.controlCSSByManually.id
          : path.join(root, stateContext.controlCSSByManually.id)
        stateContext.controlCSSByManually.id = slash(stateContext.controlCSSByManually.id)
      }
      const handle = config.appType === 'custom' ? csr : ssr
      handle(config)
      if (viteCSSPlugins.length) {
        const [plugin_1] = viteCSSPlugins
        hijackHook(plugin_1, 'transform', async (fn, context, args) => {
          // eslint-disable-next-line no-unused-vars
          const [_, id] = args
          if (stateContext.isManuallyControlCSS) {
            const { original } = parseURLRequest(id)
            if (original === stateContext.controlCSSByManually.id) {
              let code = await fsp.readFile(original, 'utf-8')
              code = code.replace(stateContext.controlCSSByManually.symbol!, stateContext.processCSS())
              args[0] = code
            }
          }
          const result = await fn.apply(context, args)
          if (id === DEFINE.MODULE_CSS && typeof result === 'object' && result?.code) {
            const module = viteDevServer?.moduleGraph.getModuleById(DEFINE.MODULE_CSS)
            module && Object.defineProperty(module, '__stylex__', { value: result.code, configurable: true })
          }
          return result
        })
      }
    },
    configureServer(server) {
      viteDevServer = server
    }
  }
}
