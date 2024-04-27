// Currently, The path processing provideed by stylex isn't compatible with tsconf
// So we need to handle them manually

import { parseSync } from '@babel/core'

export interface ImportSpecifier {
  n: string | undefined
  s: number
  e: number
}
export interface ParserOptions {
  plugins: any[]
}

export function scanImportStmt(code: string, filename: string, parserOptions?: ParserOptions) {
  const ast = parseSync(code, { parserOpts: { plugins: parserOptions?.plugins || [] }, babelrc: false, filename })!
  const stmts: ImportSpecifier[] = []
  for (const n of ast!.program.body) {
    if (n.type === 'ImportDeclaration') {
      const v = n.source.value 
      if (!v) continue
      const { start: s, end: e } = n.source
      if (typeof s === 'number' && typeof e === 'number') {
        stmts.push({ n: v, s: s + 1, e: e - 1 })
      }
    }
  }
  return stmts
}
