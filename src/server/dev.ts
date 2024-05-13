import fs from 'fs'
import type { ModuleNode, Plugin, ViteDevServer } from 'vite'
import { DEFINE } from '../core'
import { StateContext } from '../core/state-context'
import { parseURLRequest } from '../core/manually-order'
import { hijackHook } from './hijack'
import { createStylexDevMiddleware } from './middleware'

// HMR is a black box for me and i don't have enough time to analyze it.
// Alough i know how HMR works.
// If someone know how to desgin better HMR for stylex, please PR welcome.
// I'm glad someone to refactor this part.
// TODO: nonzzz

export function stylexDev(plugin: Plugin, context: StateContext, cssPlugins: Plugin[]) {
  const { isManuallyControlCSS, controlCSSByManually } = context
  let viteDevServer: ViteDevServer | null = null
  const [plugin_1] = cssPlugins
  const cssId = isManuallyControlCSS ? controlCSSByManually.id : DEFINE.MODULE_CSS

  const reloadModule = async (viteServer: ViteDevServer, id: string) => {
    const { moduleGraph } = viteServer
    let modules: Set<ModuleNode> = new Set()
    if (isManuallyControlCSS) {
      const files = moduleGraph.getModulesByFile(id)
      if (files) {
        modules = files
      }
    } else {
      const module = moduleGraph.getModuleById(id)
      module && modules.add(module)
    }
    for (const m of [...modules]) {
      await viteServer.reloadModule(m)
    }
  }

  hijackHook(plugin_1, 'transform', async (fn, c, args) => {
    const { original } = parseURLRequest(args[1])
    if (isManuallyControlCSS) {
      args[0] = fs.readFileSync(controlCSSByManually.id!, 'utf8')
        .replace(controlCSSByManually.symbol!, context.processCSS())
    }
    const result = await fn.apply(c, args)
    if (original === cssId && typeof result === 'object' && result?.code) {
      const module = viteDevServer?.moduleGraph.getModuleById(args[1])
      if (module) {
        Object.defineProperty(module, '__stylex__', { value: result.code, configurable: true })
      }
    }
    return result
  })

  plugin.resolveId = function (id) {
    if (id === DEFINE.MODULE_ID) return DEFINE.MODULE_CSS 
  }

  plugin.load = function (id) {
    if (id === DEFINE.MODULE_CSS) return context.processCSS()
  }

  plugin.transform = hijackHook(plugin, 'transform', async (fn, c, args) => {
    const res = await fn.apply(c, args)
    if (typeof res === 'object' && res?.code) {
      const id = args[1]
      if (!context.styleRules.has(id)) return res
      if (!isManuallyControlCSS) {
        res.code = [`import "${DEFINE.MODULE_ID}";`, res.code].join('\n')
      } 
      if (viteDevServer) {
        await reloadModule(viteDevServer, isManuallyControlCSS ? controlCSSByManually.id! : DEFINE.MODULE_CSS)
      }
    }
    return res
  }, true)
  
  plugin.configureServer = function (server) {
    viteDevServer = server
    if (isManuallyControlCSS) return
    // we can't give up this part even is not a good way.
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
}
