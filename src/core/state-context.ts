import path from 'path'
import { createFilter } from '@rollup/pluginutils'
import stylex from '@stylexjs/babel-plugin'
import type { Rule } from '@stylexjs/babel-plugin'
import type { StylexExtendBabelPluginOptions } from '@stylex-extend/babel-plugin'
import type { ManuallyControlCssOrder, RollupPluginContext, StylexExtendOptions, StylexOptions, StylexPluginOptions } from '../interface'
import { slash } from '../shared'
import { defaultControlCSSOptions } from './manually-order'
import { scanImportStmt } from './import-stmt'
import type { ImportSpecifier } from './import-stmt'

export type ENV = 'dev' | 'prod'

type Options = Required<Pick<StylexPluginOptions, 'useCSSLayers' | 'importSources' | 'manuallyControlCssOrder'>> & Pick<StylexPluginOptions, 'include' | 'exclude'>

function handleRelativePath(from: string, to: string) {
  const relativePath = path.relative(path.dirname(from), to).replace(/\.\w+$/, '')
  return `./${slash(relativePath)}`
}

const defaultExtendOptions: StylexExtendOptions = {
  enableInjectGlobalStyle: true,
  stylex: { helper: 'props' }
}

export class StateContext {
  styleRules: Map<string, Rule[]>
  globalStyleRules: Map<string, string>
  options: Options
  stylexOptions: StylexOptions
  extendOptions: StylexExtendBabelPluginOptions
  env: ENV
  #filter: ReturnType<typeof createFilter> | null
  #pluginContext: RollupPluginContext | null
  stmts: ImportSpecifier[]
  constructor() {
    this.#filter = null
    this.#pluginContext = null
    this.styleRules = new Map()
    this.options = Object.create(null)
    this.stylexOptions = Object.create(null)
    this.extendOptions = Object.create(null)
    this.env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev'
    this.stmts = []
    this.globalStyleRules = new Map()
  }

  setupOptions(options: Options, stylexOptions: StylexOptions, extendOptions: StylexExtendOptions | boolean) {
    this.options = options
    this.stylexOptions = { ...this.stylexOptions, ...stylexOptions }
    this.#filter = createFilter(options.include, options.exclude)
    if (typeof extendOptions === 'boolean' && extendOptions) {
      this.extendOptions = { ...defaultExtendOptions }
    }
    if (typeof extendOptions === 'object') {
      this.extendOptions = { ...defaultExtendOptions, ...extendOptions }
    }
  }

  setupPluginContext(pluginContext: RollupPluginContext) {
    if (this.#pluginContext) return
    this.#pluginContext = pluginContext
  }

  get rollupTransformContext() {
    return this.#pluginContext
  }

  get controlCSSByManually() {
    const { manuallyControlCssOrder } = this.options
    if (typeof manuallyControlCssOrder === 'boolean' && manuallyControlCssOrder) {
      return defaultControlCSSOptions
    }
    if (typeof manuallyControlCssOrder === 'object' && manuallyControlCssOrder) {
      return { ...defaultControlCSSOptions, ...manuallyControlCssOrder }
    }
    return {}
  }

  set controlCSSByManually(next: ManuallyControlCssOrder) {
    this.options.manuallyControlCssOrder = { ...this.controlCSSByManually, ...next }
  }

  get isManuallyControlCSS() {
    return !!this.controlCSSByManually.id
  }

  get importSources() {
    if (!this.options.importSources) throw new Error('[vite-plugin-stylex-dev]: Missing "importSources" in options')
    return this.options.importSources
  }

  skipResolve(code: string, id: string): boolean {
    if (!this.#filter!(id) || id.startsWith('\0')) return false
    const stmts = scanImportStmt(code, id)
    let pass = false
    for (const stmt of stmts) {
      const { n } = stmt
      if (n && this.importSources.some(i => !path.isAbsolute(n) && n.includes(typeof i === 'string' ? i : i.from))) {
        pass = true
      }
    }
    this.stmts = stmts
    return pass
  }

  // Don't forget to sync offsets
  async rewriteImportStmts(code: string, id: string) {
    let byteOffset = 0
    for (const stmt of this.stmts) {
      if (!stmt.n) continue
      if (path.isAbsolute(stmt.n) || stmt.n[0] === '.') continue
      if (!this.importSources.some(i => stmt.n!.includes(typeof i === 'string' ? i : i.from))) continue
      const resolved = await this.#pluginContext!.resolve(stmt.n, id)
      if (resolved && resolved.id && !resolved.external) {
        if (resolved.id === stmt.n) continue
        if (!resolved.id.includes('node_modules')) {
          const next = handleRelativePath(id, resolved.id)
          const start = stmt.s + byteOffset
          const end = stmt.e + byteOffset
          code = code.substring(0, start) + next + code.substring(end)
          byteOffset += next.length - (stmt.e - stmt.s)
        }
      }
    }
    this.stmts = []
    return code
  }

  processCSS(): string {
    if (!this.styleRules.size) return ''
    const { useCSSLayers } = this.options
    return stylex.processStylexRules([...this.styleRules.values()].flat().filter(Boolean), useCSSLayers) + '\n' +
    [...this.globalStyleRules.values()].join('\n')
  }

  destroy() {
    this.#filter = null
    this.#pluginContext = null
    this.styleRules.clear()
    this.globalStyleRules.clear()
  }
}

export function createStateContext() {
  return new StateContext()
}
