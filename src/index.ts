import path from 'path'
import stylexBabelPlugin from '@stylexjs/babel-plugin'
import flowSyntaxPlugin from '@babel/plugin-syntax-flow'
import jsxSyntaxPlugin from '@babel/plugin-syntax-jsx'
import typescriptSyntaxPlugin from '@babel/plugin-syntax-typescript'

import type { PluginItem } from '@babel/core'
import * as babel from '@babel/core'
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import type { Rule } from '@stylexjs/babel-plugin'
import { FilterPattern } from '@rollup/pluginutils'
import { createFilter } from '@rollup/pluginutils'

interface UnstableModuleResolution {
  type: 'commonJS' | 'haste' | 'experimental_crossFileParsing',
  rootDir: string
}

interface BabelConfig {
  plugins: Array<PluginItem>
  presets: Array<PluginItem>
}

interface StylexPluginOptions {
  include?: FilterPattern
  exclude?: FilterPattern
  unstable_moduleResolution?: UnstableModuleResolution
  fileName?: string
  babelConfig?: BabelConfig
  stylexImports?: string[]
  [prop: string]: any
}

function slash(path: string) {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path)
  if (isExtendedLengthPath) return path
  return path.replace(/\\/g, '/')
}

// eslint-disable-next-line no-unused-vars
function handleOutputOptions(conf: ResolvedConfig) {
  const outputs: Set<string> = new Set()
  const prepareAbsPath = (root: string, sub: string) => slash(path.resolve(root, sub))
  if (conf.build.rollupOptions?.output) {
    const outputOptions = Array.isArray(conf.build.rollupOptions.output)
      ? conf.build.rollupOptions.output
      : [conf.build.rollupOptions.output]
    outputOptions.forEach((opt) => {
      if (typeof opt === 'object' && !Object.keys(opt).length) return
      outputs.add(prepareAbsPath(conf.root, opt.dir || conf.build.outDir))
    })
  } else {
    outputs.add(prepareAbsPath(conf.root, conf.build.outDir))
  }
  return outputs
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

export function stylexPlugin(opts: StylexPluginOptions = {}): Plugin {
  const {
    unstable_moduleResolution = { type: 'commonJS', rootDir: process.cwd() },
    fileName = 'stlex.css',
    babelConfig: { plugins = [], presets = [] } = {},
    stylexImports = ['stylex', '@stylexjs/stylex'],
    include = /\.(mjs|js|ts|vue|jsx|tsx)(\?.*|)$/,
    exclude,
    ...options
  } = opts
  const filter = createFilter(include, exclude)
  let stylexRules: Record<string, Rule[]> = {}
  let isProd = false
  let assetsDir = 'assets'
  let publicDir = '/'
  let viteServer: ViteDevServer | null = null

  const processStylexRules = () => {
    const rules = Object.values(stylexRules).flat()
    if (!rules.length) return
    return stylexBabelPlugin.processStylexRules(rules, false)
  }

  return {
    name: 'vite-plugin-stylex',
    enforce: 'post',
    buildStart() {
      stylexRules = {}
    },
    shouldTransformCachedModule({ id, meta }) {
      stylexRules[id] = meta.stylex
      return false
    },
    configureServer(server) {
      viteServer = server
    },
    configResolved(conf) {
      isProd = conf.mode === 'production' || conf.env.mode === 'production'
      assetsDir = conf.build.assetsDir ?? 'assets'
      publicDir = conf.base || '/'
    },
    load(id) {
      if (id === VIRTUAL_STYLEX_CSS_MODULE) return processStylexRules()
    },
    resolveId(id) {
      if (id === VIRTUAL_STYLEX_MODULE) return VIRTUAL_STYLEX_CSS_MODULE
    },
    async transform(inputCode, id, transformOptios) {
      if (!filter(id)) return
      if (!stylexImports.some((importName) => inputCode.includes(importName))) return
      const result = await transformWithStylex(inputCode, id, { isProduction: isProd, presets, plugins, unstable_moduleResolution, ...options })
      if (!result) return
      if ('stylex' in result.metadata) {
        const rules = result.metadata.stylex as Rule[]
        if (!rules.length) return
        result.code = `import ${JSON.stringify(VIRTUAL_STYLEX_MODULE)};\n${result.code}`
        stylexRules[id] = rules
      }
      if (viteServer) {
        const { moduleGraph } = viteServer
        const virtualModule = moduleGraph.getModuleById(VIRTUAL_STYLEX_CSS_MODULE)
        if (virtualModule) {
          moduleGraph.invalidateModule(virtualModule)
          virtualModule.lastHMRTimestamp = Date.now()
        }
      }
      return {
        code: result.code,
        map: result.map,
        meta: result.metadata
      }
    },
    transformIndexHtml(html, ctx) {
      if (!isProd) return html
      // const publicPath = path.join(publicBasePath, fileName);
      return {
        html,
        tags: [
          {
            tag: 'link',
            injectTo: 'head',
            attrs: {
              rel: 'stylesheet',
              href: path.join(publicDir, fileName)
            }
          }
        ]
      }
    },
    generateBundle() {
      // respect vite's assetDir
      const collectedCSS = processStylexRules()
      if (!collectedCSS) return
      const outputFile = path.join(assetsDir, fileName)
      this.emitFile({ fileName: outputFile, source: collectedCSS, type: 'asset' })
    }
  }
}
