import type { Plugin, ViteDevServer } from 'vite'
import type { Rule } from '@stylexjs/babel-plugin'
import type { AdapterConfig } from '../interface'
import { CONSTANTS } from '../plugins/server'
import { parseRequest } from '../context'

const STYLEX_FOR_WAKU_MARKER = '/__stylex__waku.css'

const CLASSIC_WAKU_MARKER = '@stylex-dev.css'

const sharedRules = new Map<string, Rule[]>()

// I would like know why can't sync the rules for sharedRules. It seems like got two instance of waku

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
          viteDevServer?.reloadModule(mod)
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
        },
        load(id) {
          // Idk why i can't set css rule. waku seems like split vite plugin and
          // run in two instance? you can print the sharedRules and run example/waku
          // you can get collection one is three the other one is two.
          // CLASSIC_WAKU_MARKER is work for rsc. but we should take care for them.
          if (id === STYLEX_FOR_WAKU_MARKER || id === CLASSIC_WAKU_MARKER) {
            if (id === CLASSIC_WAKU_MARKER) {
              entries.add(id)
            }
            return {
              code: ctx.produceCSS(sharedRules),
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
          if (typeof result === 'object' && result?.meta && 'stylex' in result.meta) {
            const rule: Rule[][] = []
            if (result.meta.stylex.length > 0) {
              rule.push(result.meta.stylex)
            }
            effects.add(original)
            sharedRules.set(original, result.meta.stylex)
            invalidate(new Set([...entries]))
          }

          return result
        }
      }

      Object.assign(plugin, self)
    }
  }
}
