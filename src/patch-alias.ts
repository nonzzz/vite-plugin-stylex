// Notice this file is a temporary solution for stylex
// Stylex work support alias in future. 
// This patch does not change vite's behavior
// It's should also work well with tsconfPaths plugin
// https://github.com/facebook/stylex/issues/40

// eg:
// import { kind } from '@/x.stylex'
// convert:
// import { kind } from './x.stylex'
import path from 'path'
import MagicString from 'magic-string'
import type { ImportSpecifier } from 'es-module-lexer'
import type { Alias, AliasOptions, Plugin } from 'vite'
import { init, parse } from 'es-module-lexer'
import type { RollupPluginContext } from './interface'

interface PatchAliasOptions {
  tsconfigPaths?: Plugin,
}

type AliasPath = ImportSpecifier & { relative: string }

function handleRelativePath(from: string, to: string) {
  let relativePath = path.relative(path.dirname(from), to).replace(/\.\w+$/, '')
  relativePath = `./${relativePath}`
  return relativePath
}

export function createPatchAlias(alias: AliasOptions & Alias[], opts: PatchAliasOptions) {
  const relativeReg = /^\.\.?(\/|$)/
  const finds = Array.isArray(alias) ? alias.map((a) => a.find) : []
  init.then()
  return async (code: string, id: string, rollupContext: RollupPluginContext) => {
    const str = new MagicString(code)
    const [imports] = parse(code)
    const withAliasPath: AliasPath[] = []
    for (const stmt of imports) {
      if (!stmt.n) continue
      if (stmt.d > -1) continue
      if (path.isAbsolute(stmt.n) || relativeReg.test(stmt.n)) continue

      if (opts.tsconfigPaths) {
        const fn = opts.tsconfigPaths.resolveId as Function
        if (stmt.n.includes('stylex')) {
          const result = await fn.call(rollupContext, stmt.n, id)
          if (result) {
            const relativePath = handleRelativePath(id, result)
            if (!relativePath.includes('node_modules')) {
              withAliasPath.push({ ...stmt, relative: relativePath })
            }
          }
        }
      } else {
        if (!finds.some(f => {
          if (typeof f === 'string') return stmt.n.includes(f)
          return f.test(stmt.n)
        })) continue
        // https://rollupjs.org/plugin-development/#plugin-context
        const resolved = await rollupContext.resolve(stmt.n, id)
        if (resolved && resolved.id) {
          const relativePath = handleRelativePath(id, resolved.id)
          if (!relativePath.includes('node_modules')) {
            withAliasPath.push({ ...stmt, relative: relativePath })
          }
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
