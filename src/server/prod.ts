import fs from 'fs'
import path from 'path'
import type { Plugin } from 'vite'
import { DEFINE } from '../core'
import { StateContext } from '../core/state-context'
import { parseURLRequest } from '../core/manually-order'
import { slash } from '../shared'
import { hijackHook } from './hijack'

const fsp = fs.promises

function ensureFileExt(name: string, ext: string) {
  return slash(
    path.format({ ...path.parse(name), base: undefined, ext })
  )
}

const regex = /export\s+default\s+"([^"]+)"/

function extractCssFromExportDefault(s: string) {
  const match = s.match(regex)
  if (match && match.length > 1) {
    return match[1].replace(/\\\\/g, '\\')
  }
  return ''
}

export function stylexProd(plugin: Plugin, context: StateContext, cssPlugins: Plugin[]) {
  const { isManuallyControlCSS, controlCSSByManually } = context
  const [plugin_1, plugin_2] = cssPlugins
  let finallyCSS = ''
  // hijack vite:css-post logic
  if (isManuallyControlCSS) {
    const cssAssetName = ensureFileExt(path.basename(controlCSSByManually.id!), '.css')
    plugin.generateBundle = async function (_, bundles) {
      for (const k in bundles) {
        const bundle = bundles[k]
        if (bundle.name === cssAssetName && bundle.type === 'asset') {
          bundle.source = finallyCSS
        }
      }
    }
  }

  plugin.renderChunk = async function (_, chunk) {
    const hook = hijackHook(plugin_1, 'transform', (fn, context, args) => fn.apply(context, args), true)!
    const postHook = hijackHook(plugin_2, 'transform', (fn, context, args) => fn.apply(context, args), true)!
    const css = context.processCSS()
    let code = css
    if (isManuallyControlCSS) {
      code = await fsp.readFile(controlCSSByManually.id!, 'utf8') 
      code = code.replace(controlCSSByManually.symbol!, css)
    }
    for (const id of chunk.moduleIds) {
      const { original, kind } = parseURLRequest(id)
      if (original === controlCSSByManually.id && kind === 'native') {
        delete chunk.modules[id]
      }
      if (isManuallyControlCSS && original !== controlCSSByManually.id) continue
      // For some reason, when postcss or lightining-css transformed the css import stmt
      // It need the real path of the css file, so we need respect the original path
      const moduleId = kind === 'native'
        ? DEFINE.MODULE_CSS
        : (isManuallyControlCSS ? controlCSSByManually.id : DEFINE.MODULE_CSS) + '?inline'
      const result = await hook.apply(this, [code, moduleId])
      if (typeof result === 'object' && result?.code) {
        const res = await postHook.apply(this, [result.code, moduleId])
        if (isManuallyControlCSS && typeof res === 'object' && res.code && kind !== 'native') {
          finallyCSS = extractCssFromExportDefault(res.code)
        } else {
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
}
