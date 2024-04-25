import fs from 'fs'
import path from 'path'
import type { Plugin, TransformResult } from 'vite'
import { DEFINE, stateContext, stylex } from '../core'
import type { StylexPluginOptions } from '../interface'
import { searchForWorkspaceRoot, slash } from '../shared'
import { parseURLRequest } from '../manually-order'
import { hijackHook } from './hijack'

const fsp = fs.promises

export function stylexProd(opts: StylexPluginOptions = {}): Plugin {
  const hooks = stylex(opts)
  const viteCSSPlugins: Plugin[] = []

  return {
    ...hooks,
    configResolved(config) {
      stateContext.env = 'prod'
      const root = searchForWorkspaceRoot(config.root)
      if (!opts.unstable_moduleResolution) {
        opts.unstable_moduleResolution = { type: 'commonJS', rootDir: root }
      }
      viteCSSPlugins.push(...config.plugins.filter(p => DEFINE.HIJACK_PLUGINS.includes(p.name)))
      viteCSSPlugins.sort((a) => a.name === 'vite:css' ? 1 : -1)
      if (stateContext.controlCSSByManually.id) {
        stateContext.controlCSSByManually.id = path.isAbsolute(stateContext.controlCSSByManually.id)
          ? stateContext.controlCSSByManually.id
          : path.join(root, stateContext.controlCSSByManually.id)
        stateContext.controlCSSByManually.id = slash(stateContext.controlCSSByManually.id)
      }
    },
    async renderChunk(_, chunk) {
      const [plugin_1, plugin_2] = viteCSSPlugins
      let moduleId = DEFINE.MODULE_CSS
      if (stateContext.isManuallyControlCSS) {
        for (const id of chunk.moduleIds) {
          const { original } = parseURLRequest(id)
          if (original === stateContext.controlCSSByManually.id) {
            moduleId = id
          }
        }
      }
      let code = stateContext.isManuallyControlCSS
        ? await fsp.readFile(stateContext.controlCSSByManually.id!, 'utf8') 
        : stateContext.processCSS()
      if (stateContext.isManuallyControlCSS) {
        code = code.replace(stateContext.controlCSSByManually.symbol!, stateContext.processCSS())
      }
      const compileResult = await new Promise<TransformResult>((resolve, reject) => {
        hijackHook(plugin_1, 'transform', async (fn, context) => {
          Promise.resolve(fn.apply(context, [code, moduleId]))
          // @ts-expect-error
            .then(resolve).catch(reject)
        })
      })
      hijackHook(plugin_2, 'transform', async (fn, context) => {
        if (typeof compileResult === 'object' && compileResult) {
          await fn.apply(context, [compileResult.code, moduleId])
        }
      })
    }
  }
}
