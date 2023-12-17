import path from 'path'
import stylexBabelPlugin from '@stylexjs/babel-plugin'
import flowSyntaxPlugin from '@babel/plugin-syntax-flow'
import jsxSyntaxPlugin from '@babel/plugin-syntax-jsx'
import typescriptSyntaxPlugin from '@babel/plugin-syntax-typescript'
import type { NextHandleFunction } from 'connect'
import type { PluginItem } from '@babel/core'
import * as babel from '@babel/core'
import type { Plugin, ViteDevServer } from 'vite'
import type { Rule } from '@stylexjs/babel-plugin'
import type { FilterPattern } from '@rollup/pluginutils'
import { createFilter } from '@rollup/pluginutils'

interface UnstableModuleResolution {
  type: 'commonJS' | 'haste' | 'experimental_crossFileParsing',
  rootDir: string
}

interface BabelConfig {
  plugins: Array<PluginItem>
  presets: Array<PluginItem>
}

export interface StylexPluginOptions {
  include?: FilterPattern
  exclude?: FilterPattern
  unstable_moduleResolution?: UnstableModuleResolution
  fileName?: string
  babelConfig?: BabelConfig
  stylexImports?: string[]
  [prop: string]: any
}

interface TransformWithStylexOptions extends Partial<BabelConfig> {
  isProduction?: boolean
  unstable_moduleResolution?: UnstableModuleResolution
  [prop: string]: any
}

function transformWithStylex(code: string, id: string, transformOptions: TransformWithStylexOptions = {}) {
  const { isProduction = false, presets = [], plugins = [], unstable_moduleResolution, ...options } = transformOptions
  const isJSX = path.extname(id) === '.jsx' || path.extname(id) === '.tsx'
  return babel.transformAsync(code, {
    babelrc: false,
    filename: id,
    presets,
    plugins: [...plugins, 
      /\.jsx?/.test(path.extname(id)) 
        ? flowSyntaxPlugin
        : typescriptSyntaxPlugin,
      isJSX && jsxSyntaxPlugin,
      [stylexBabelPlugin, { dev: !isProduction, unstable_moduleResolution, runtimeInjection: false, ...options }]
    ].filter(Boolean)
  })
}

// stylex provide a dev runtime AFAK. 
// But from a design principles. We won't need it. Only using virtual module is enough.
// Judging from the previous experimental implementation of style9,It's worth to do it.

const VIRTUAL_STYLEX_MODULE = '\0stylex:virtual'

const VIRTUAL_STYLEX_CSS_MODULE = VIRTUAL_STYLEX_MODULE + '.css'

const VITE_INTERNAL_CSS_PLUGIN_NAMES = ['vite:css', 'vite:css-post']

const VITE_TRANSFORM_MIDDLEWARE_NAME = 'viteTransformMiddleware'

function createSSRMiddleware(processStylexRules: () => string): NextHandleFunction {
  return function stylexDevMiddleware(req, res, next) {
    const protocol = 'encrypted' in req.connection ? 'https' : 'http'
    const { host } = req.headers
    const url = new URL(req.originalUrl, `${protocol}://${host}`)
    if (url.pathname.endsWith('.css') && url.pathname.includes('stylex:virtual')) {
      // Check style sheet is registered.
      res.setHeader('Content-Type', 'text/css')
      res.end(processStylexRules())
      return
    }
    next()
  }
}

// TODO
export function stylexPlugin(opts: StylexPluginOptions = {}): Plugin {
  const {
    unstable_moduleResolution = { type: 'commonJS', rootDir: process.cwd() },
    babelConfig: { plugins = [], presets = [] } = {},
    stylexImports = ['stylex', '@stylexjs/stylex'],
    include = /\.(mjs|js|ts|vue|jsx|tsx)(\?.*|)$/,
    exclude,
    ...options
  } = opts
  const filter = createFilter(include, exclude)
  let stylexRules: Record<string, Rule[]> = {}
  let isProd = false
  let viteServer: ViteDevServer | null = null
  const viteCSSPlugins: Plugin[] = []
  const processStylexRules = () => {
    const rules = Object.values(stylexRules).flat()
    if (!rules.length) return
    return stylexBabelPlugin.processStylexRules(rules, false)
  }

  return {
    name: 'vite-plugin-stylex',
    buildStart() {
      stylexRules = {}
    },
    shouldTransformCachedModule({ id, meta }) {
      stylexRules[id] = meta.stylex
      return false
    },
    // https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/index.ts#L715-L745
    // https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/transform.ts#L175-L187
    // https://github.com/BuilderIO/qwik/blob/main/packages/qwik/src/optimizer/src/plugins/vite-server.ts#L55-L56
    configureServer(server) {
      viteServer = server
      // Enable middleware when the project is custrom render or ssr 
      // Make sure the insert order
      // reset the order of the middlewares
      return () => {
        if (viteServer.config.appType === 'custom' || viteServer.config.server.middlewareMode) {
          const stylexDevMiddleware = createSSRMiddleware(processStylexRules)
          viteServer.middlewares.use(stylexDevMiddleware)
          const order = viteServer.middlewares.stack.findIndex(m => {
            if (typeof m.handle === 'function') return m.handle.name === VITE_TRANSFORM_MIDDLEWARE_NAME
            return -1
          })
          viteServer.middlewares.stack.splice(order + 1, 0, viteServer.middlewares.stack[viteServer.middlewares.stack.length - 1])
          viteServer.middlewares.stack.pop()
        }
      }
    },
    configResolved(conf) {
      isProd = conf.mode === 'production' || conf.env.mode === 'production'
      viteCSSPlugins.push(...conf.plugins.filter(p => VITE_INTERNAL_CSS_PLUGIN_NAMES.includes(p.name)))
      viteCSSPlugins.sort((a, b) => a.name === 'vite:css' && b.name === 'vite:css-post' ? -1 : 1)
    },
    load(id) {
      if (id === VIRTUAL_STYLEX_CSS_MODULE) {
        return processStylexRules()
      }
    },
    resolveId(id) {
      if (id === VIRTUAL_STYLEX_MODULE) return VIRTUAL_STYLEX_CSS_MODULE
    },
    async transform(inputCode, id) {
      if (!filter(id)) return
      if (!stylexImports.some((importName) => inputCode.includes(importName))) return
      const result = await transformWithStylex(inputCode, id, { isProduction: isProd, presets, plugins, unstable_moduleResolution, ...options })
      if (!result) return
      if ('stylex' in result.metadata) {
        const rules = result.metadata.stylex as Rule[]
        if (!rules.length) return
        // pipe to vite's internal plugin for processing.
        result.code = `import ${JSON.stringify(VIRTUAL_STYLEX_MODULE)};\n${result.code}`
        stylexRules[id] = rules
      }
      if (viteServer) {
        const { moduleGraph } = viteServer
        const virtualModule = moduleGraph.getModuleById(VIRTUAL_STYLEX_CSS_MODULE)
        if (virtualModule) {
          moduleGraph.invalidateModule(virtualModule, new Set())
          virtualModule.lastHMRTimestamp = Date.now()
        }
      }
      return {
        code: result.code,
        map: result.map,
        meta: result.metadata
      }
    },
    async renderChunk(_, chunk) {
      // plugin_1 is vite:css plugin using it we will re set the finally css (Vite using prost-css in here.)
      // plugin_2 is vite:css-post plugin. vite will compress css here.
      const [plugin_1, plugin_2] = viteCSSPlugins
      for (const moudleId of chunk.moduleIds) {
        if (moudleId.includes(VIRTUAL_STYLEX_CSS_MODULE)) {
          if (typeof plugin_1.transform === 'function' && typeof plugin_2.transform === 'function') {
            const { code: css } = await plugin_1.transform.call(this, processStylexRules(), VIRTUAL_STYLEX_CSS_MODULE)
            await plugin_2.transform.call(this, css, VIRTUAL_STYLEX_CSS_MODULE)
          }
        }
      }
    }
  }
}
