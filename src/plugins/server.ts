import type { Plugin, Update, ViteDevServer } from 'vite'
import { PluginContext, parseRequest } from '../context'
import { hash, hijackHook } from '../shared'

export const CONSTANTS = {
  WS_EVENT: 'stylex:hmr',
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
      return '/__stylex.css'
    }
  }
}

let hmr = `
try {
  let hash = __vite__css.match(/__stylex_hash_(\\w{${CONSTANTS.HASH_LENGTH}})/)
  hash = hash && hash[1]
  if (!hash) {
   console.log('[vite-plugin-stylex]', 'Failed to get stylex hash, hmr might not work!')
  } else {
    await import.meta.hot.send('${CONSTANTS.WS_EVENT}', hash)
  }

} catch (e) {
  console.warn('[vite-plugin0-stylex]', e)
}
if (!import.meta.url.include('?')) {
   await new Promise(r => setTimeout(r, 100))
}
`

hmr = `\nif (import.meta.hot) { ${hmr} }`

export function stylexServer(plugin: Plugin, ctx: PluginContext) {
  let viteDevServer: ViteDevServer | null = null
  let lastServerTime = Date.now()
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

  // const onInvalidate

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

  let invalidateTimer: any

  const invalidate = (ids: Set<string>) => {
    for (const id of ids) {
      const mod = viteDevServer?.moduleGraph.getModuleById(id)
      if (!mod) continue
      viteDevServer?.moduleGraph.invalidateModule(mod)
    }
    clearTimeout(invalidateTimer)
    invalidateTimer = setTimeout(() => {
      update(ids)
    }, 10)
  }

  const entries = new Set<string>()

  const schedule = <Partial<Plugin>> {
    enforce: 'pre',
    name: 'stylex:server',
    apply: 'serve',
    resolveId(id: string) {
      const entry = resolveId(id)
      if (entry) {
        entries.add(entry)
        return entry
      }
    },
    load(id: string) {
      const { original } = parseRequest(id)
      const matched = original.match(CONSTANTS.RESOLVED_ID_REG)
      if (matched) {
        const { hash, css } = generateCSS()
        return {
          code: `${css}__stylex_hash_${hash}{--:'';}`,
          map: { mappings: '' }
        }
      }
    },
    configureServer(server) {
      viteDevServer = server
      viteDevServer.ws.on(CONSTANTS.WS_EVENT, () => {
        update(entries)
      })
    }
  }

  hijackHook(plugin, 'configResolved', (fn, _, c) => {
    const pos = c[0].plugins.findIndex(p => p.name === 'stylex')
    // @ts-expect-error
    c[0].plugins.splice(pos, 0, schedule)
    fn(...c)
  })
  //
  hijackHook(plugin, 'transform', async (fn, c, args) => {
    const id = args[1]
    const { original } = parseRequest(id)
    const result = await fn.apply(c, args)
    if (ctx.styleRules.has(original)) {
      // record affect module.
      modules.add(original)
      invalidate(new Set([...entries, ...modules]))
    }
    if (original.match(CONSTANTS.RESOLVED_ID_REG)) {
      const code = args[0] + hmr
      return { code, map: { mappings: '' } }
    }
    return result
  })
}
