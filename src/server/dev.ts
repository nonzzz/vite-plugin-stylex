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
  const cssId = isManuallyControlCSS ? controlCSSByManually.id + '?transform-only' : DEFINE.MODULE_CSS

  const transformHook = hijackHook(plugin_1, 'transform', async (fn, c, args) => {
    const result = await fn.apply(c, args)
    if (args[1] === cssId && typeof result === 'object' && result?.code) {
      const module = viteDevServer?.moduleGraph.getModuleById(cssId)
      module && Object.defineProperty(module, '__stylex__', { value: result.code, configurable: true })
    }
    return result
  }, true)

  plugin.resolveId = function (id) {
    console.log(id, 'cn')
  }

  plugin.transform = hijackHook(plugin, 'transform', async (fn, c, args) => {
    const res = await fn.apply(c, args)
    if (typeof res === 'object' && res?.code) {
      const id = args[1]
      if (!context.styleRules.has(id)) return res
      const css = context.processCSS()
      let raw = css
      if (isManuallyControlCSS) {
        raw = fs.readFileSync(controlCSSByManually.id!, 'utf8')
        raw = raw.replace(controlCSSByManually.symbol!, css)
      }
      await transformHook.apply(c, [raw, cssId, args[2]])
    }
    return res
  }, true)
  
  plugin.configureServer = function (server) {
    viteDevServer = server
    // return () => {
    //   const middleware = createStylexDevMiddleware({ viteServer: server, context })
    //   server.middlewares.use(middleware)
    //   const order = server.middlewares.stack.findIndex(m => {
    //     if (typeof m.handle === 'function') return m.handle.name === DEFINE.HIJACK_MIDDLEWARE
    //     return -1
    //   })
    //   const current = server.middlewares.stack.pop()!
    //   server.middlewares.stack.splice(order, 0, current)
    // }
  }
}
