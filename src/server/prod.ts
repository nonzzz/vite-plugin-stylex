import fs from 'fs'
import type { Plugin } from 'vite'
import { DEFINE } from '../core'
import { StateContext } from '../core/state-context'
import { parseURLRequest } from '../core/manually-order'
import { hijackHook } from './hijack'

export function stylexProd(plugin: Plugin, context: StateContext, cssPlugins: Plugin[]) {
  const { isManuallyControlCSS, controlCSSByManually } = context
  const [plugin_1, plugin_2] = cssPlugins

  const expect = isManuallyControlCSS ? controlCSSByManually.id! : DEFINE.MODULE_CSS

  const lazy = {
    get ids() {
      if (isManuallyControlCSS) {
        return {
          base: controlCSSByManually.id!,
          url: controlCSSByManually.id + '?url',
          transformOnly: controlCSSByManually.id + '?transform-only'
        }
      }
      throw new Error('Invalid call')
    }
  }

  plugin.load = function (id) {
    if (id === DEFINE.MODULE_CSS) return context.processCSS()
  }

  plugin.resolveId = function (id) {
    if (id === DEFINE.MODULE_ID) return DEFINE.MODULE_CSS
  }
  
  const hook = hijackHook(plugin_1, 'transform', (fn, c, args) => {
    const { original } = parseURLRequest(args[1])
    if (original === expect) {
      args[0] = args[0] ? args[0].replace(controlCSSByManually.symbol!, context.processCSS()) : context.processCSS()
    }
    return fn.apply(c, args)
  }, true)

  const hook_2 = hijackHook(plugin_2, 'transform', (fn, c, args) => fn.apply(c, args), true)

  const transform = hijackHook(plugin, 'transform', async (fn, c, args) => {
    const result = await fn.apply(c, args)
    if (typeof result === 'object' && result && context.styleRules.has(args[1])) {
      const pass = []
      const css = isManuallyControlCSS ? fs.readFileSync(controlCSSByManually.id!, 'utf8') : ''
      if (isManuallyControlCSS) {
        const ids = new Set(c.getModuleIds())
        const { base, transformOnly } = lazy.ids
        if (ids.has(transformOnly)) {
          pass.push(transformOnly)
        }
        if (ids.has(base)) {
          pass.push(base)
        }
      } else {
        pass.push(DEFINE.MODULE_CSS)
        result.code = `import "${DEFINE.MODULE_ID}";\n${result.code}`
      }
      for (const id of pass) {
        const res = await hook.apply(c, [css, id, args[2]])
        await hook_2.apply(res.code, [res?.code || '', id, args[2]])
      }
    }
    return result
  }, true)

  plugin.transform = transform
}
