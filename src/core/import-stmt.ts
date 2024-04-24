// Currently, The path processing provideed by stylex isn't compatible with tsconf
// So we need to handle them manually

import { RollupPluginContext } from '../interface'

export interface ImportSpecifier {
  n: string | undefined
  s: number
  e: number
}

export function scanImportStmt(code: string, rollupContext: RollupPluginContext) {
  const ast = rollupContext.parse(code)
  const stmts: ImportSpecifier[] = []
  for (const n of ast.body) {
    if (n.type === 'ImportDeclaration') {
      const v = n.source.value as string
      if (!v) continue
      // @ts-expect-error
      const { start: s, end: e } = stmt.source
      stmts.push({ n: v, s: s + 1, e: e - 1 })
    }
  }
  return stmts
}
