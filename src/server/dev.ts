import fs from 'fs'
import type { Plugin, ViteDevServer } from 'vite'
import { DEFINE } from '../core'
import { StateContext } from '../core/state-context'
import { parseURLRequest } from '../core/manually-order'
import { hijackHook } from './hijack'
import { createStylexDevMiddleware } from './middleware'

const fsp = fs.promises

export function stylexDev(plugin: Plugin, context: StateContext, cssPlugins: Plugin[]) {
  const { isManuallyControlCSS, controlCSSByManually } = context
  let viteDevServer: ViteDevServer | null = null
  const [plugin_1] = cssPlugins
  
  plugin.configureServer = function (server) {
    viteDevServer = server
    return () => {
      const middleware = createStylexDevMiddleware({ viteServer: server, context })
      server.middlewares.use(middleware)
      const order = server.middlewares.stack.findIndex(m => {
        if (typeof m.handle === 'function') return m.handle.name === DEFINE.HIJACK_MIDDLEWARE
        return -1
      })
      const current = server.middlewares.stack.pop()!
      server.middlewares.stack.splice(order, 0, current)
    }
  }
  plugin.load = function (id) {
    if (id === DEFINE.MODULE_CSS) return context.processCSS()
  }

  plugin.resolveId = function (id) {
    if (id === DEFINE.MODULE_ID) return DEFINE.MODULE_CSS
  }

  hijackHook(plugin_1, 'transform', async (fn, c, args) => {
    // eslint-disable-next-line no-unused-vars
    const [_, id] = args
    if (isManuallyControlCSS) {
      const { original } = parseURLRequest(id)
      if (original === controlCSSByManually.id) {
        let code = await fsp.readFile(controlCSSByManually.id, 'utf-8')
        code = code.replace(controlCSSByManually.symbol!, context.processCSS())
        args[0] = code
      }
    }
    const result = await fn.apply(c, args)
    if (id === DEFINE.MODULE_CSS && typeof result === 'object' && result?.code) {
      const module = viteDevServer?.moduleGraph.getModuleById(DEFINE.MODULE_CSS)
      module && Object.defineProperty(module, '__stylex__', { value: result.code, configurable: true })
    }
    return result
  })
 
  const transform = hijackHook(plugin, 'transform', async (fn, c, args) => {
    const result = await fn.apply(c, args)
    if (typeof result === 'object' && result) {
      // eslint-disable-next-line no-unused-vars
      const [_, id] = args
      let { code } = result
      if (context.styleRules.has(id)) {
        if (!isManuallyControlCSS) {
          code = `import ${JSON.stringify(DEFINE.MODULE_ID)};\n${code}`
        }
      }
      if (viteDevServer) {
        const module = viteDevServer.moduleGraph.getModuleById(DEFINE.MODULE_CSS)
        if (module) await viteDevServer.reloadModule(module)
        if (isManuallyControlCSS) {
          const cssModules = viteDevServer.moduleGraph.getModulesByFile(controlCSSByManually.id!)
          if (cssModules) {
            for (const m of cssModules) {
              await viteDevServer.reloadModule(m)
            }
          }
        }
      }
      return { ...result, code }
    }
  }, true)

  // rewrite 
  plugin.transform = transform
}
