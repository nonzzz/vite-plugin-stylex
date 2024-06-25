import type { Plugin } from 'vite'
import type { Plugin as RollupPlugin } from 'rollup'
import type { Rule } from '@stylexjs/babel-plugin'
import type { StylexExtendTransformObject } from '@stylex-extend/babel-plugin'
import type { StylexPluginOptions } from './interface'
import { PluginContext, createPluginContext, parseRequest, scanImportStmt } from './context'
import { transformStylex, transformStylexExtend } from './transformer'
import { createForViteServer } from './plugins'

type BabelConfig = StylexPluginOptions['babelConfig']

export type StylexPluginAPI = {
  ctx: ReturnType<typeof createPluginContext>
}

const defaultBabelConfig = <BabelConfig> {
  plugins: [],
  presets: []
}

const defaultOptions = <StylexPluginOptions> {
  useCSSLayers: false,
  babelConfig: defaultBabelConfig,
  importSources: ['stylex', '@stylexjs/stylex'],
  include: /\.(mjs|js|ts|vue|jsx|tsx)(\?.*|)$/,
  optimizedDeps: [],
  manuallyControlCssOrder: false,
  enableStylexExtend: false
}

function extend(ctx: PluginContext) {
  let extend: StylexExtendTransformObject | null = null
  return <Plugin> {
    name: 'stylex-extend',
    buildStart() {
      ctx.globalStyles = {}
      if (!extend) {
        import('@stylex-extend/babel-plugin').then(mod => extend = mod.default)
      }
    },
    transform: {
      order: 'pre',
      async handler(code, id) {
        if (id.includes('/node_modules/')) return
        if (!ctx.filter(id)) return
        ctx.setupRollupPluginContext(this)
        const { original } = parseRequest(id)
        const parserOptions: string[] = []
        if (!original.endsWith('.ts')) {
          parserOptions.push('jsx')
        }
        if (/\.tsx?$/.test(original)) {
          parserOptions.push('typescript')
        }
        const stmts = scanImportStmt(code, id, { plugins: parserOptions })
        code = await ctx.rewriteImportStmts(code, original, stmts)
        const result = await transformStylexExtend(code, {
          filename: original,
          options: { parserOptions, opts: ctx.stylexExtendOptions, extend: extend! },
          env: ctx.env
        })
        if (!result || !result.code) return
        if (result.metadata && 'globalStyle' in result.metadata) {
          ctx.globalStyles[original] = result.metadata.globalStyle as string
        }
        return { code: result.code, map: result.map }
      }
    }
  }
}

function stylex(options: StylexPluginOptions = {}) {
  options = { ...defaultOptions, ...options }

  const c = createPluginContext(options)

  const plugin = <Plugin> {
    name: 'stylex',
    api: {
      ctx: c
    },
    buildStart() {
      if (this.meta.watchMode) {
        c.styleRules.clear()
      }
    },
    shouldTransformCachedModule({ id, meta }) {
      if ('stylex' in meta && meta.stylex) {
        const { original } = parseRequest(id)
        c.styleRules.set(original, meta.stylex)
      }
      return false
    },
    async transform(code, id) {
      c.setupRollupPluginContext(this)
      if (!c.skipResolve(code, id)) return
      const { original } = parseRequest(id)
      code = await c.rewriteImportStmts(code, original)
      const result = await transformStylex(code, { filename: original, env: c.env, options: c.stylexOptions })
      if (!result || !result.code) return
      if (result.metadata && 'stylex' in result.metadata) {
        const rules = result.metadata.stylex as Rule[]
        if (rules.length) c.styleRules.set(original, rules)
      }
      return { code: result.code, map: result.map, meta: result.metadata }
    }
  }

  const server = createForViteServer(c, extend)
  server(plugin)

  return plugin
}

stylex.getPluginAPI = (plugins: readonly Plugin[]): StylexPluginAPI => plugins.find(p => p.name === 'stylex')?.api

export type AdapterStylexPluginOptions = StylexPluginOptions & {
  filename: string
}

function adapter(plugin: typeof stylex, options: AdapterStylexPluginOptions): RollupPlugin {
  const { filename = 'stylex.css', ...rest } = options
  const { api, ...hooks } = plugin(rest)
  const { ctx } = api as StylexPluginAPI
  return {
    ...hooks,
    generateBundle() {
      this.emitFile({ fileName: filename, source: ctx.produceCSS(), type: 'asset' })
    }
  }
}

export { adapter, stylex, stylex as default }

export type { StylexOptions, StylexPluginOptions } from './interface'
