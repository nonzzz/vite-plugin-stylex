import type { Plugin, ViteDevServer } from 'vite'
import { Rule } from '@stylexjs/babel-plugin'
import type { AdapterConfig } from '../interface'
import { CONSTANTS } from '../plugins/server'
import { parseRequest } from '../context'

const STYLEX_FOR_WAKU_MARKER = '/__stylex__waku.css'
/** */

const hmr = (css: string) => `
import { createHotContext as __vite__createHotContext } from "/@vite/client"
import.meta.hot = __vite__createHotContext("/__stylex__waku.css")
import { updateStyle as __vite__updateStyle, removeStyle as __vite__removeStyle } from "/@vite/client"

const __vite__id = "/__stylex__waku.css"
const __vite__css = ${JSON.stringify(css)}
__vite__updateStyle(__vite__id, __vite__css)
import.meta.hot.accept()
import.meta.hot.prune(() => __vite__removeStyle(__vite__id))

`
const sharedRules = new Map<string, Rule[]>()

export function waku() {
  return <AdapterConfig> {
    name: 'waku',
    setup(ctx, plugin) {
      if (ctx.env === 'build') return
      // @ts-expect-error
      ctx.vite.config.plugins = ctx.vite.config.plugins.filter(p => p.name !== 'stylex:server')

      let viteDevServer: ViteDevServer | null = null
      const entries: Set<string> = new Set()
      const effects: Set<string> = new Set()

      const invalidate = (ids: Set<string>) => {
        for (const id of ids) {
          const mod = viteDevServer?.moduleGraph.getModuleById(id)
          if (!mod) continue
          viteDevServer?.moduleGraph.invalidateModule(mod)
        }
      }

      const self = <Partial<Plugin>> {
        configureServer(server) {
          viteDevServer = server

          viteDevServer.watcher.on('unlink', (path) => {
            const { original } = parseRequest(path)
            if (sharedRules.has(original)) {
              sharedRules.delete(original)
              // update hmr
            }
          })

          viteDevServer.middlewares.use((req, res, next) => {
            const protocol = 'encrypted' in (req?.socket ?? {}) ? 'https' : 'http'
            const { host } = req.headers
            // @ts-ignore
            const url = new URL(req.originalUrl, `${protocol}://${host}`)
            if (url.pathname === STYLEX_FOR_WAKU_MARKER) {
              res.writeHead(200, {
                'Content-Type': 'application/javascript',
                'x-powered-by': 'vite-plugin-stylex-dev'
              })
              res.end(hmr(ctx.produceCSS(sharedRules)))
              return
            }
            next()
          })
        },
        load(id) {
          if (id === STYLEX_FOR_WAKU_MARKER) {
            return {
              code: '',
              map: { mappings: '' }
            }
          }
        },
        resolveId(id) {
          if (id === CONSTANTS.VIRTUAL_STYLEX_ID) {
            entries.add(STYLEX_FOR_WAKU_MARKER)
            return STYLEX_FOR_WAKU_MARKER
          }
        },
        async transform(code, id, opt) {
          const result = await ctx.transform?.apply(this, [code, id, opt])
          const { original } = parseRequest(id)
          if (ctx.rules.has(original)) {
            effects.add(original)
            sharedRules.set(original, ctx.rules.get(original)!)
            invalidate(entries)
          }
          return result
        }
      }

      Object.assign(plugin, self)
    }
  }
}
