// Notice this file is a temporary solution for stylex
// Stylex work support alias in future. 
// This patch does not change vite's behavior
// It's should also work well with tsconfPaths plugin
// https://github.com/facebook/stylex/issues/40
// stylex Support path aliases at v0.5.0 (But is ts paths like)
// but stylex can't convert all of scense.
// So this patch should continue to be retained.

// eg:
// import { kind } from '@/x.stylex'
// convert:
// import { kind } from './x.stylex'
import path from 'path'
import { normalizePath } from 'vite'
import MagicString from 'magic-string'
import type { ImportSpecifier } from 'es-module-lexer'
import { parse } from 'es-module-lexer'
import type { InternalOptions, RollupPluginContext } from './interface'

interface PatchAliasOptions {
  parse: typeof parse
  importSources: InternalOptions['importSources']
}

type AliasPath = ImportSpecifier & { relative: string }

function handleRelativePath(from: string, to: string) {
  const relativePath = path.relative(path.dirname(from), to).replace(/\.\w+$/, '')
  return `./${normalizePath(relativePath)}`
}

export function createPatchAlias(opts: PatchAliasOptions) {
  const relativeReg = /^\.\.?(\/|$)/
  return async (code: string, id: string, rollupContext: RollupPluginContext) => {
    const str = new MagicString(code)
    const [imports] = opts.parse(code)
    const withAliasPath: AliasPath[] = []
    for (const stmt of imports) {
      if (!stmt.n) continue
      if (stmt.d > -1) continue
      if (path.isAbsolute(stmt.n) || relativeReg.test(stmt.n)) continue
      if (!opts.importSources.some(i => stmt.n.includes(typeof i === 'string' ? i : i.from))) continue
      const resolved = await rollupContext.resolve(stmt.n, id)
      if (resolved && resolved.id && !resolved.external) {
        if (resolved.id === stmt.n) continue
        if (!resolved.id.includes('node_modules')) {
          const relativePath = handleRelativePath(id, resolved.id)
          withAliasPath.push({ ...stmt, relative: relativePath })
        }
      }
    }
    withAliasPath.forEach((stmt) => {
      const { s, e, relative } = stmt
      str.update(s, e, relative)
    })
    return str.toString()
  }
}
