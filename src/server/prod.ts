import fs from 'fs'
import type { Plugin } from 'vite'
import { DEFINE } from '../core'
import { StateContext } from '../core/state-context'
import { parseURLRequest } from '../core/manually-order'
import { hijackHook } from './hijack'

const fsp = fs.promises

export function stylexProd(plugin: Plugin, context: StateContext, cssPlugins: Plugin[]) {
  const { isManuallyControlCSS, controlCSSByManually, rollupTransformContext } = context
  const [plugin_1, plugin_2] = cssPlugins

  plugin.renderChunk = async function (_, chunk) {
    const moduleId = isManuallyControlCSS ? controlCSSByManually.id! : DEFINE.MODULE_CSS
    if (isManuallyControlCSS) {
      for (const id of chunk.moduleIds) {
        const { original } = parseURLRequest(id)
        if (original === controlCSSByManually.id) {
          delete chunk.modules[id]
        }
      }
    }
    let code = isManuallyControlCSS
      ? await fsp.readFile(controlCSSByManually.id!, 'utf8') 
      : context.processCSS()
    if (isManuallyControlCSS) {
      code = code.replace(controlCSSByManually.symbol!, context.processCSS())
    }
    const hook = hijackHook(plugin_1, 'transform', (fn, context, args) => fn.apply(context, args), true)!
    const postHook = hijackHook(plugin_2, 'transform', (fn, context, args) => fn.apply(context, args), true)!
    if (typeof hook === 'function' && typeof postHook === 'function') {
      const result = await hook.apply(rollupTransformContext!, [code, moduleId])
      if (typeof result === 'object' && result?.code) {
        await postHook.apply(rollupTransformContext!, [result.code, moduleId])
        chunk.modules[moduleId] = {
          code: 'export default "__STYLEX__DEV__"',
          originalLength: 0,
          renderedLength: 0,
          removedExports: [],
          renderedExports: []
        }
      }
    }
  }
}
