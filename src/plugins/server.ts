import type { Plugin, Update, ViteDevServer } from 'vite'
import { PluginContext, parseRequest } from '../context'
import { hash, hijackHook } from '../shared'

export const CONSTANTS = {
  WS_EVENT_PREFIX: 'stylex:hmr',
  VIRTUAL_STYLEX_ID: 'virtual:stylex.css',
  RESOLVED_ID_WITH_QUERY_REG: /[/\\]__stylex(_.*?)?\.css(\?.*)?$/,
  RESOLVED_ID_REG: /[/\\]__stylex(?:_(.*?))?\.css$/,
  VIRTUAL_ENTRY_ALIAS: [/^(?:virtual:)?stylex(?::(.+))?\.css(\?.*)?$/],
  STYLEX_BUNDLE_MARK: '@stylex__bundle__marker;',
  HASH_LENGTH: 6,
  CSS_PLUGINS: ['vite:css', 'vite:css-post'],
  WELL_KNOW_LIBRARIES: ['@stylexjs/open-props']
}

export function resolveId(id: string) {
  if (id.match(CONSTANTS.RESOLVED_ID_WITH_QUERY_REG)) {
    return id
  }
  for (const alias of CONSTANTS.VIRTUAL_ENTRY_ALIAS) {
    const matched = id.match(alias)
    if (matched) {
      return matched[1]
        ? `/__stylex_${matched[1]}.css`
        : '/__stylex.css'
    }
  }
}

export function stylexServer(plugin: Plugin, ctx: PluginContext) {
  let viteDevServer: ViteDevServer | null = null
  // const resolved = false
  let lastServerTime = Date.now()
  const cssCaches: Map<string, string> = new Map()
  const modules = new Set<string>()

  const generateCSS = () => {
    let css = ''
    const expect = modules.size
    for (;;) {
      css = ctx.produceCSS()
      if (expect === ctx.styleRules.size) {
        break
      }
    }
    lastServerTime = Date.now()
    return { css, hash: hash(css) }
  }

  const update = (ids: Set<string>) => {
    if (!viteDevServer) return
    viteDevServer.ws.send({
      type: 'update',
      updates: Array.from(ids).map(id => {
        const mod = viteDevServer?.moduleGraph.getModuleById(id)
        if (!mod) return null
        return {
          acceptedPath: id,
          path: mod.url,
          timestamp: lastServerTime,
          type: 'js-update'
        } as Update
      }).filter((s) => s !== null) as Update[]
    })
  }

  const entries = new Set<string>()
  plugin.enforce = 'post'

  plugin.configureServer = function configureServer(server) {
    viteDevServer = server
    viteDevServer.ws.on(CONSTANTS.WS_EVENT_PREFIX, () => {
      update(entries)
    })
  }
  plugin.resolveId = function handler(id: string) {
    const entry = resolveId(id)
    if (entry) {
      entries.add(entry)
      return entry
    }
  }

  plugin.load = async function handler(id: string) {
    const { original } = parseRequest(id)
    const matched = original.match(CONSTANTS.RESOLVED_ID_REG)
    if (matched) {
      const { hash, css } = generateCSS()
      cssCaches.set(hash, css)
      return {
        code: `${css}__stylex_hash_${hash}{--:'';}`,
        map: { mappings: '' }
      }
    }
  }

  hijackHook(plugin, 'transform', async (fn, c, args) => {
    const [code, id] = args
    const { original } = parseRequest(id)
    const result = await fn.apply(c, args)
    if (ctx.styleRules.has(original) && result) {
      modules.add(id)

      return result
    } else {
      // inject css modules to send callback on css load
      if (original.match(CONSTANTS.RESOLVED_ID_REG)) {
        if (code.includes('import.meta.hot')) {
          let hmr = `try {
           let hash = __vite__css.match(/__stylex_hash_(\\w{${CONSTANTS.HASH_LENGTH}})/)
           hash = hash && hash[1]
           if (!hash) {
              console.warn('[vite-plugin-stylex]', 'Failed to get stylex hash, hmr might not work!')
           } else {
             await import.meta.hot.send('${CONSTANTS.WS_EVENT_PREFIX}', hash) 
           }
          } catch (e) {
            console.warn('[vite-plugin-stylex]', e) 
          }
          if (!import.meta.url.includes('?')) {
             await new Promise(resolve => setTimeout(resolve, 100))
          }
           `
          hmr = `\nif (import.meta.hot) {${hmr}}`
          const s = code + hmr
          // const placeholder = 'const __vite__css = '
          // const pos = s.indexOf(placeholder) + placeholder.length
          // const length = s.length
          // let n = pos
          // for (let i = pos; i < length; i++) {
          //   if (s[i] === '\n') {
          //     break
          //   }
          //   n++
          // }
          // const { css, hash } = generateCSS()
          // s = s.replace(s.substring(pos, n), `"${css}__stylex_hash_${hash}{--:'';}"`)
          return { code: s, map: { mappings: '' } }
        }
      }
    }
  })
}
