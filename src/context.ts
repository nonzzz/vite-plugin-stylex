import path from 'path'
import stylexBabelPlugin from '@stylexjs/babel-plugin'
import type { Rule } from '@stylexjs/babel-plugin'
import { createFilter } from '@rollup/pluginutils'
import { parseSync } from '@babel/core'
import type { StylexExtendBabelPluginOptions } from '@stylex-extend/babel-plugin'
import type { ManuallyControlCssOrder, RollupPluginContext, StylexPluginOptions } from './interface'
import { error, slash } from './shared'
import { CONSTANTS } from './plugins/server'

export type Env = 'server' | 'build'

export interface ImportSpecifier {
  n: string | undefined
  s: number
  e: number
}
export interface ParserOptions {
  plugins: any[]
}

export const defaultControlCSSOptions = {
  id: 'stylex.css',
  symbol: '@stylex-dev;'
}

export const defaultStylexExtendOptions = {
  enableInjectGlobalStyle: true,
  stylex: { helper: 'props' }
}

function handleRelativePath(from: string, to: string) {
  const relativePath = path.relative(path.dirname(from), to).replace(/\.\w+$/, '')
  return `./${slash(relativePath)}`
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

export function parseRequest(id: string) {
  const [original, kind] = id.split('?')
  if (!kind) return { original, kind: 'native' }
  return { original, kind }
}

export class PluginContext {
  styleRules: Map<string, Rule[]>
  globalStyles: Record<string, string>
  #pluginOptions: StylexPluginOptions
  root: string
  #env: Env
  #rollupPluginContext: RollupPluginContext | null
  #stmts: ImportSpecifier[]
  constructor(options: StylexPluginOptions) {
    this.styleRules = new Map()
    this.#rollupPluginContext = null
    this.#pluginOptions = options
    this.#stmts = []
    this.globalStyles = {}
    this.root = process.cwd()
    this.#env = process.env.NODE_ENV === 'production' ? 'build' : 'server'
  }

  get filter() {
    return createFilter(this.#pluginOptions.include, this.#pluginOptions.exclude)
  }

  get stylexExtendOptions(): StylexExtendBabelPluginOptions {
    const { enableStylexExtend } = this.#pluginOptions
    if (typeof enableStylexExtend === 'boolean' && enableStylexExtend) {
      return { ...defaultStylexExtendOptions }
    }
    if (typeof enableStylexExtend === 'object') {
      if (!enableStylexExtend) return {}
      return { ...defaultStylexExtendOptions, ...enableStylexExtend }
    }
    return {}
  }

  get stylexOptions() {
    return this.#pluginOptions
  }

  setupRollupPluginContext(rollupPluginContext: RollupPluginContext) {
    if (this.#rollupPluginContext) return
    this.#rollupPluginContext = rollupPluginContext
  }

  skipResolve(code: string, id: string) {
    if (!this.filter!(id) || id.startsWith('\0')) return false
    const { kind } = parseRequest(id)
    if (kind.includes('.css')) return false
    this.#stmts = scanImportStmt(code, id)
    let pass = false
    for (const stmt of this.#stmts) {
      const { n } = stmt
      // @ts-ignore
      if (n && this.importSources.some(i => !path.isAbsolute(n) && n.includes(typeof i === 'string' ? i : i.from))) {
        pass = true
      }
    }
    return pass
  }

  // Alough stylex/stylex-extend support translate path aliases to relative path
  // But it only supports tsconfig-style aliases. Now we have parsed the import stmt
  // So why not transform them to relative path directly?
  async rewriteImportStmts(code: string, id: string, stmts = this.#stmts) {
    let byteOffset = 0
    for (const stmt of stmts) {
      if (!stmt.n) continue
      if (path.isAbsolute(stmt.n) || stmt.n[0] === '.') continue
      // @ts-ignore
      if (!this.importSources.some(i => stmt.n!.includes(typeof i === 'string' ? i : i.from))) continue
      const resolved = await this.#rollupPluginContext!.resolve(stmt.n, id)
      if (resolved && resolved.id && !resolved.external) {
        if (resolved.id === stmt.n) continue
        if (CONSTANTS.RESOLVED_ID_REG.test(resolved.id)) continue
        if (!resolved.id.includes('node_modules')) {
          const next = handleRelativePath(id, resolved.id)
          const start = stmt.s + byteOffset
          const end = stmt.e + byteOffset
          code = code.substring(0, start) + next + code.substring(end)
          byteOffset += next.length - (stmt.e - stmt.s)
        }
      }
    }
    this.#stmts = []
    return code
  }

  produceCSS() {
    if (!this.styleRules.size) return ''
    const { useCSSLayers } = this.stylexOptions
    return stylexBabelPlugin.processStylexRules([...this.styleRules.values()].flat().filter(Boolean), useCSSLayers!) + '\n' +
      Object.values(this.globalStyles).join('\n')
  }

  destory() {
    this.styleRules.clear()
    this.root = process.cwd()
    this.globalStyles = {}
    this.#rollupPluginContext = null
  }

  // We don't recommend using NODE_ENV to determine the environment type.
  // Instead, we recommend using a custom environment variable.
  // If their are any reports about this. we can add a note to the docs.
  get env() {
    return this.#env
  }

  set env(env: Env) {
    this.#env = env
  }

  get importSources() {
    if (!this.#pluginOptions.importSources) throw error('Missing "importSources" in options')
    return this.#pluginOptions.importSources
  }

  get stmts() {
    return this.#stmts
  }

  get rollupPluginContext() {
    return this.#rollupPluginContext
  }

  get controlCSSByManually(): ManuallyControlCssOrder {
    const { manuallyControlCssOrder } = this.stylexOptions
    let opt = <ManuallyControlCssOrder> {}
    if (typeof manuallyControlCssOrder === 'boolean' && manuallyControlCssOrder) {
      opt = { ...defaultControlCSSOptions }
    }
    if (typeof manuallyControlCssOrder === 'object' && manuallyControlCssOrder) {
      opt = { ...defaultControlCSSOptions, ...manuallyControlCssOrder }
    }
    if ('id' in opt) {
      opt.id = slash(opt.id!)
    }
    return opt
  }

  get isManuallyControlCSS() {
    return !!this.controlCSSByManually.id
  }
}

export function createPluginContext(options: StylexPluginOptions) {
  return new PluginContext(options)
}
