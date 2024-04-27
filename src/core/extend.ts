// styex extend need handle all of path alias before process.
import { createFilter } from '@rollup/pluginutils'
import { transformAsync } from '@babel/core'
import { type Plugin } from 'vite'
import type { StylexExtendTransformObject } from '@stylex-extend/babel-plugin'
import { StateContext } from './state-context'
import { parseURLRequest } from './manually-order'
import { scanImportStmt } from './import-stmt'

export function stylexExtend(context: StateContext) {
  const filter = createFilter(/\.[jt]sx?$/, [])
  let extend: StylexExtendTransformObject | null = null
  return <Plugin>{
    name: 'stylex-extend',
    buildStart() {
      context.globalStyleRules.clear()
      import('@stylex-extend/babel-plugin').then((mod) => {
        extend = mod.default
      })
    },
    transform: {
      order: 'pre',
      async handler(code, id) {
        if (id.includes('/node_modules/')) return
        if (!filter(id)) return
        context.setupPluginContext(this)
        const { original } = parseURLRequest(id)
        const parserOptions: any[] = []
        if (!original.endsWith('.ts')) {
          parserOptions.push('jsx')
        }
        if (/\.tsx?$/.test(original)) {
          parserOptions.push('typescript')
        }
        context.stmts = scanImportStmt(code, id, { plugins: parserOptions })
        code = await context.rewriteImportStmts(code, original)
        const result = await transformAsync(code, {
          plugins: [extend!.withOptions(context.extendOptions)],
          parserOpts: { plugins: parserOptions },
          babelrc: false,
          filename: original
        })
        if (!result) return
        if (result.metadata && 'globalStyle' in result.metadata) {
          context.globalStyleRules.set(id, result.metadata.globalStyle as string)
        }
        return {
          code: result.code!,
          map: result.map!
        }
      }
    }
  }
}
