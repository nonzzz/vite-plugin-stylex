import type { HookHandler, Plugin, ResolvedConfig, Update, ViteDevServer } from 'vite'
import { PluginContext, parseRequest } from '../context'
import { hash, hijackHook } from '../shared'

export type CssHooks = Map<'vite:css' | 'vite:css-post' | string & ({}), HookHandler<Plugin['transform']>>

export interface InternalConfig {
  config: ResolvedConfig
  cssHooks: CssHooks
  ctx: PluginContext
}

export interface ScannerAPI {
  entries: Set<string>
  effects: Set<string>
  lastHMRTime: () => number
}

export const CONSTANTS = {
  WS_EVENT: 'stylex:hmr',
  VIRTUAL_STYLEX_ID: 'virtual:stylex.css',
  RESOLVED_ID_WITH_QUERY_REG: /[/\\]__stylex(_.*?)?\.css(\?.*)?$/,
  RESOLVED_ID_REG: /[/\\]__stylex(?:_(.*?))?\.css$/,
  VIRTUAL_ENTRY_ALIAS: [/^(?:virtual:)?stylex(?::(.+))?\.css(\?.*)?$/],
  STYLEX_CSS: '/__stylex.css',
  STYLEX_BUNDLE_MARK: '@stylex__bundle__marker;',
  HASH_LENGTH: 6,
  CSS_PLUGINS: ['vite:css', 'vite:css-post'],
  WELL_KNOW_LIBRARIES: ['@stylexjs/open-props'],
  STYLEX_START_COMMENT: '__stylex-dev-start__{--:"";}',
  STYLEX_END_COMMENT: '__stylex-dev-end__{--:"";}'
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
  console.warn('[vite-plugin-stylex]', e)
}
if(!import.meta.url.includes('?')) {
   await new Promise(r => setTimeout(r, 100))
}
`

hmr = `\nif (import.meta.hot) { ${hmr} }`

export function createHasteCSS(ctx: PluginContext, effects: Set<string>) {
  return (handler?: (css: string) => void) => {
    let css = ''
    for (;;) {
      css = ctx.produceCSS()
      if (effects.size === ctx.styleRules.size) {
        break
      }
    }
    handler?.(css)
    return css
  }
}

export function stylexServer(self: Plugin, options: InternalConfig) {
  const { ctx, config } = options
  let viteServer: ViteDevServer | null = null
  const { isManuallyControlCSS, controlCSSByManually } = ctx
  const effects = new Set<string>()
  const entries = new Set<string>()
  let lastHash = ''
  let lastHMRTime = Date.now()
  const generateCSS = createHasteCSS(ctx, effects)

  const update = (ids: Set<string>) => {
    viteServer?.ws.send({
      type: 'update',
      updates: Array.from(ids).map(id => {
        const mod = viteServer?.moduleGraph.getModuleById(id)
        if (!mod) return null
        return {
          acceptedPath: id,
          path: mod.url,
          timestamp: lastHMRTime,
          type: mod.type === 'css' ? 'css-update' : 'js-update'
        } satisfies Update
      }).filter((s) => s !== null) as Update[]
    })
  }
  const onInvalidate = (ids: Set<string>) => {
    for (const id of ids) {
      const mod = viteServer?.moduleGraph.getModuleById(id)
      if (!mod) continue
      viteServer?.moduleGraph.invalidateModule(mod)
    }
    update(ids)
  }

  const scan = {
    name: 'stylex:server-scan',
    enforce: 'pre',
    apply: 'serve',
    api: {
      entries,
      effects,
      lastHMRTime: () => lastHMRTime
    },
    configureServer(server) {
      viteServer = server
      server.ws.on(CONSTANTS.WS_EVENT, () => {
        let uuid = ''
        generateCSS((css) => uuid = hash(css))
        if (uuid !== lastHash) {
          lastHMRTime = Date.now()
          update(entries)
        }
      })
    },
    resolveId(id) {
      if (resolveId(id)) {
        entries.add(CONSTANTS.STYLEX_CSS)
        return CONSTANTS.STYLEX_CSS
      }
    },
    load(id) {
      const { original } = parseRequest(id)
      if (isManuallyControlCSS && original === controlCSSByManually.id) {
        entries.add(id)
      }

      if (original.match(CONSTANTS.RESOLVED_ID_REG) && !isManuallyControlCSS) {
        let uuid = ''
        const css = generateCSS((css) => {
          uuid = hash(css)
        })
        lastHMRTime = Date.now()
        lastHash = uuid
        return {
          code: `${css}__stylex_hash_${uuid}{--:'';}`,
          map: { mappings: '' }
        }
      }
    },
    transform(code, id) {
      // It's only update direct css file.
      if (isManuallyControlCSS && entries.has(id)) {
        let uuid = ''
        const css = generateCSS((css) => {
          uuid = hash(css)
        })
        lastHMRTime = Date.now()
        lastHash = uuid
        if (code.includes(CONSTANTS.STYLEX_START_COMMENT) && code.includes(CONSTANTS.STYLEX_END_COMMENT)) {
          const start = code.indexOf(CONSTANTS.STYLEX_START_COMMENT) + CONSTANTS.STYLEX_START_COMMENT.length
          const end = code.indexOf(CONSTANTS.STYLEX_END_COMMENT)
          code = code.substring(0, start) + css + code.substring(end)
        } else {
          code = code.replace(
            controlCSSByManually.symbol!,
            CONSTANTS.STYLEX_START_COMMENT +
              `${css}__stylex_hash_${uuid}{--:'';}` + CONSTANTS.STYLEX_END_COMMENT
          )
        }

        return { code, map: { mappings: '' } }
      }
    }
  } satisfies Plugin

  const schedule = {
    name: 'stylex:server-schedule',
    enforce: 'post',

    async transform(code, id) {
      // force blocking css generation
      if (entries.has(id)) {
        if (code.includes('import.meta.hot')) {
          code = code + hmr
        }
        return {
          code,
          map: { mappings: '' }
        }
      }
    }
  } satisfies Plugin

  const pos = config.plugins.findIndex(p => p.name === 'vite:css')
  // @ts-expect-error
  config.plugins.splice(pos, 0, scan)
  const cssPostPos = config.plugins.findIndex(p => p.name === 'vite:css-post')
  // @ts-expect-error
  config.plugins.splice(cssPostPos + 1, 0, schedule)

  hijackHook(self, 'transform', async (fn, c, args) => {
    const result = await fn.apply(c, args)
    const { original } = parseRequest(args[1])
    if (result && typeof result === 'object') {
      if (ctx.styleRules.has(original)) {
        effects.add(original)
        onInvalidate(new Set([args[1], ...entries]))
      }
    }
    return result
  })
}
