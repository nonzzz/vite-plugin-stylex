import fs from 'fs'
import path from 'path'
import type { Plugin } from 'vite'
import { DEFINE, stateContext, stylex } from '../core'
import { parseURLRequest } from '../core/manually-order'
import type { StylexPluginOptions } from '../interface'
import { searchForWorkspaceRoot, slash, unique } from '../shared'
import { hijackHook } from './hijack'

const fsp = fs.promises

export function stylexProd(opts: StylexPluginOptions = {}): Plugin {
  const { closeBundle: _, ...hooks } = stylex(opts)
  const viteCSSPlugins: Plugin[] = []

  return {
    ...hooks,
    configResolved(config) {
      stateContext.env = 'prod'
      const root = searchForWorkspaceRoot(config.root)
      const { stylexOptions, importSources } = stateContext
      if (!stylexOptions.unstable_moduleResolution) {
        stylexOptions.unstable_moduleResolution = { type: 'commonJS', rootDir: root }
      }
      viteCSSPlugins.push(...config.plugins.filter(p => DEFINE.HIJACK_PLUGINS.includes(p.name)))
      viteCSSPlugins.sort((a) => a.name === 'vite:css' ? 1 : 0)
      if (stateContext.controlCSSByManually.id) {
        stateContext.controlCSSByManually.id = path.isAbsolute(stateContext.controlCSSByManually.id)
          ? stateContext.controlCSSByManually.id
          : path.join(root, stateContext.controlCSSByManually.id)
        stateContext.controlCSSByManually.id = slash(stateContext.controlCSSByManually.id)
      }
      const optimizedDeps = unique([...(Array.isArray(opts.optimizedDeps) 
        ? opts.optimizedDeps
        : []), ...importSources.map(s => typeof s === 'object' ? s.from : s)])
      if (config.appType === 'custom') {
        config.ssr.noExternal = Array.isArray(config.ssr.noExternal)
          ? [...config.ssr.noExternal, ...optimizedDeps, '@stylexjs/open-props']
          : config.ssr.noExternal
      }
    },
    async renderChunk(_, chunk) {
      const [plugin_1, plugin_2] = viteCSSPlugins
      
      const moduleId = stateContext.isManuallyControlCSS ? stateContext.controlCSSByManually.id! : DEFINE.MODULE_CSS
      if (stateContext.isManuallyControlCSS) {
        for (const id of chunk.moduleIds) {
          const { original } = parseURLRequest(id)
          if (original === stateContext.controlCSSByManually.id) {
            delete chunk.modules[id]
          }
        }
      }
      let code = stateContext.isManuallyControlCSS
        ? await fsp.readFile(stateContext.controlCSSByManually.id!, 'utf8') 
        : stateContext.processCSS()
      if (stateContext.isManuallyControlCSS) {
        code = code.replace(stateContext.controlCSSByManually.symbol!, stateContext.processCSS())
      }
      const hook = hijackHook(plugin_1, 'transform', (fn, context, args) => fn.apply(context, args), true)
      const postHook = hijackHook(plugin_2, 'transform', (fn, context, args) => fn.apply(context, args), true)
      if (hook && postHook) {
        // @ts-expect-error
        const res = await hook.apply(this, [code, moduleId])
        // @ts-expect-error
        if (res.code) await postHook.apply(this, [res.code, moduleId])
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
