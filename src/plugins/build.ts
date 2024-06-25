import fs from 'fs'
import type { HookHandler, Plugin } from 'vite'
import { PluginContext, parseRequest } from '../context'
import { hijackHook } from '../shared'
import { CONSTANTS, resolveId } from './server'

// This implement is a relatively stable version.

export function stylexBuild(plugin: Plugin, ctx: PluginContext, cssPlugins: Plugin[]) {
  const cssHooks = new Map<'vite:css' | 'vite:css-post' | string & ({}), HookHandler<Plugin['transform']>>()
  const entries = new Set<string>()
  const self = <Partial<Plugin>> {
    enforce: 'post',
    resolveId(id) {
      const entry = resolveId(id)
      if (entry) {
        entries.add(entry)
        return entry
      }
    },
    load(id) {
      const { original } = parseRequest(id)
      const matched = original.match(CONSTANTS.RESOLVED_ID_REG)
      if (matched) {
        return CONSTANTS.STYLEX_BUNDLE_MARK
      } else {
        if (ctx.isManuallyControlCSS && original === ctx.controlCSSByManually.id) {
          entries.add(id)
          return CONSTANTS.STYLEX_BUNDLE_MARK
        }
      }
    },
    renderChunk: {
      // By declare order we can get better performance for generate styles.
      async handler(_, chunk) {
        if (!cssHooks.size) {
          cssPlugins.forEach((p) => {
            cssHooks.set(p.name, hijackHook(p, 'transform', (fn, c, args) => fn.apply(c, args), true))
          })
        }
        if (!chunk.moduleIds.some(s => entries.has(s))) {
          return null
        }
        for (const entry of [...entries]) {
          let css = ctx.produceCSS()
          if (!CONSTANTS.RESOLVED_ID_REG.test(entry) && ctx.isManuallyControlCSS) {
            const { original } = parseRequest(entry)
            css = ctx.isManuallyControlCSS ? fs.readFileSync(original, 'utf8').replace(ctx.controlCSSByManually.symbol!, css) : css
          }
          const res = await cssHooks.get('vite:css')?.apply({} as any, [css, entry])
          // @ts-expect-error
          await cssHooks.get('vite:css-post')?.apply({} as any, [res?.code || '', entry])
          chunk.modules[entry] = { code: null, originalLength: 0, removedExports: [], renderedExports: [], renderedLength: 0 }
        }
        return null
      },
      order: 'pre'
    }
  }

  Object.assign(plugin, self)
}
