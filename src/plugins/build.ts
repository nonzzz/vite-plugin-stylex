import fs from 'fs'
import type { Plugin } from 'vite'
import { parseRequest } from '../context'
import { CONSTANTS, resolveId } from './server'
import type { InternalConfig } from './server'

// This implement is a relatively stable version.

export function stylexBuild(plugin: Plugin, opts: InternalConfig) {
  const { cssHooks, ctx } = opts
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
        if (!chunk.moduleIds.some(s => entries.has(s))) {
          return null
        }
        for (const entry of [...entries]) {
          let css = ctx.produceCSS()
          if (!CONSTANTS.RESOLVED_ID_REG.test(entry) && ctx.isManuallyControlCSS) {
            const { original } = parseRequest(entry)
            css = ctx.isManuallyControlCSS ? fs.readFileSync(original, 'utf8').replace(ctx.controlCSSByManually.symbol!, css) : css
          }
          const res = await cssHooks.get('vite:css')?.apply(ctx.rollupPluginContext!, [css, entry])
          // @ts-expect-error
          await cssHooks.get('vite:css-post')?.apply(ctx.rollupPluginContext!, [res?.code || '', entry])
          chunk.modules[entry] = { code: null, originalLength: 0, removedExports: [], renderedExports: [], renderedLength: 0 }
        }
        return null
      },
      order: 'pre'
    }
  }

  Object.assign(plugin, self)
}
