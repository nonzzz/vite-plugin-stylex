import fs from 'fs'
import type { Plugin, ViteDevServer } from 'vite'
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

  const transformHook = hijackHook(plugin_1, 'transform', async (fn, c, args) => {
    const result = await fn.apply(c, args)
    const { original } = parseURLRequest(args[1])
    if (original === cssId && typeof result === 'object' && result?.code) {
      const module = viteDevServer?.moduleGraph.getModuleById(args[1])
      module && Object.defineProperty(module, '__stylex__', { value: result.code, configurable: true })
    }
    return result
  }, true)

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
      if (isManuallyControlCSS) {
        const pass: string[] = []
        const ids = new Set(c.getModuleIds())
        ids.forEach((id) => parseURLRequest(id).original === cssId && pass.push(id))
        let code = fs.readFileSync(controlCSSByManually.id!, 'utf8')
        code = code.replace(controlCSSByManually.symbol!, context.processCSS())
        for (const id of pass) {
          await transformHook.apply(c, [code, id, args[2]])
        }
      }
      if (viteDevServer) {
        const { moduleGraph } = viteDevServer
        const module = moduleGraph.getModuleById(DEFINE.MODULE_CSS)
        module && moduleGraph.invalidateModule(module, new Set(), Date.now())
      }
    }
    return res
  }, true)
  
  plugin.configureServer = function (server) {
    viteDevServer = server
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
