import path from 'path'
import fs from 'fs'
import type { Plugin, ViteDevServer } from 'vite'
import { parseURLRequest } from '../core/manually-order'
import { DEFINE, stateContext, stylex } from '../core'
import { searchForWorkspaceRoot, slash, unique } from '../shared'
import type { StylexPluginOptions } from '../interface'
import { hijackHook } from './hijack'
import { createStylexDevMiddleware } from './middleware'

const fsp = fs.promises

const WELL_KNOW_LIBRARIES = ['@stylexjs/open-props']

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
          const cssModules = viteDevServer.moduleGraph.getModulesByFile(stateContext.controlCSSByManually.id!)
          if (cssModules) {
            for (const m of cssModules) {
              await viteDevServer.reloadModule(m)
            }
          }
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
      if (config.appType === 'custom') {
        config.ssr.noExternal = Array.isArray(config.ssr.noExternal)
          ? [...config.ssr.noExternal, ...optimizedDeps, '@stylexjs/open-props']
          : config.ssr.noExternal
      }
      viteCSSPlugins.push(...config.plugins.filter(p => DEFINE.HIJACK_PLUGINS.includes(p.name)))
      viteCSSPlugins.sort((a) => a.name === 'vite:css' ? 1 : 0)
      if (stateContext.controlCSSByManually.id) {
        stateContext.controlCSSByManually.id = path.isAbsolute(stateContext.controlCSSByManually.id)
          ? stateContext.controlCSSByManually.id
          : path.join(root, stateContext.controlCSSByManually.id)
        stateContext.controlCSSByManually.id = slash(stateContext.controlCSSByManually.id)
      }
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
      return () => {
        const middleware = createStylexDevMiddleware({ viteServer: server })
        server.middlewares.use(middleware)
        const order = server.middlewares.stack.findIndex(m => {
          if (typeof m.handle === 'function') return m.handle.name === DEFINE.HIJACK_MIDDLEWARE
          return -1
        })
        const current = server.middlewares.stack.pop()!
        server.middlewares.stack.splice(order, 0, current)
      }
    }
  }
}
