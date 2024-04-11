import path from 'path'
import fsp from 'fs/promises'
import { createFilter, searchForWorkspaceRoot } from 'vite'
import stylexBabelPlugin from '@stylexjs/babel-plugin'
import flowSyntaxPlugin from '@babel/plugin-syntax-flow'
import jsxSyntaxPlugin from '@babel/plugin-syntax-jsx'
import typescriptSyntaxPlugin from '@babel/plugin-syntax-typescript'
import { init, parse } from 'es-module-lexer'
import type { NextHandleFunction } from 'connect'
import * as babel from '@babel/core'
import type { ModuleNode, Plugin, TransformResult, ViteDevServer } from 'vite'
import type { Rule } from '@stylexjs/babel-plugin'
import type { ManuallyControlCssOrder, RollupPluginContext, StylexPluginOptions, TransformStylexOptions } from './interface'
import { createPatchAlias } from './patch-alias'
import { defaultControlCSSOptions, parseURLRequest } from './manullay-order'

function transformStylex(code: string, id: string, transformOptions: TransformStylexOptions) {
  const { presets, plugins, ...rest } = transformOptions
  return babel.transformAsync(code, {
    babelrc: false,
    filename: id,
    presets,
    plugins: [...plugins, /\.jsx?/.test(path.extname(id))
      ? flowSyntaxPlugin
      : [typescriptSyntaxPlugin, { isTSX: true }],
    jsxSyntaxPlugin, stylexBabelPlugin.withOptions({ ...rest, runtimeInjection: false })]
  })
}

const VIRTUAL_STYLEX_MODULE = '\0vite-plugin:stylex'

const VIRTUAL_STYLEX_CSS_MODULE = VIRTUAL_STYLEX_MODULE + '.css'

const VIRTUAL_STYLEX_CSS_MODULE_ALIAS = '@stylex-dev.css'

const VITE_INTERNAL_CSS_PLUGIN_NAMES = ['vite:css', 'vite:css-post']

const VITE_TRANSFORM_MIDDLEWARE_NAME = 'viteTransformMiddleware'

interface StylexDevMiddlewareOptions {
  viteServer: ViteDevServer,
}

function createStylexDevMiddleware(options: StylexDevMiddlewareOptions): NextHandleFunction {
  const { viteServer } = options

  const handleModule = (module: ModuleNode, pathName: string, accept = '') => {
    const isAssets = accept.includes('text/css')
    const paths = pathName.split('/')
    paths.pop()
    let base = ''
    const filter = paths.filter(p => !['@id', '@fs'].includes(p))
    base = filter.join('/')
    if (!base) base = '/'
    let code = ''
    // @ts-expect-error
    const css = module.__stylex__
    if (isAssets) {
      code = css
    } else {
      code = [
        `import {createHotContext as __vite__createHotContext} from ${JSON.stringify(path.posix.join(base, '@vite/client'))};`,
        'import.meta.hot = __vite__createHotContext("/@id/__x00__vite-plugin:stylex.css");',
        `import {updateStyle as __vite__updateStyle,removeStyle as __vite__removeStyle} from ${JSON.stringify(path.posix.join(base, '@vite/client'))};`,
        'const __vite__id = "\u0000vite-plugin:stylex.css"',
        `const __vite__css = ${JSON.stringify(css)}`,
        '__vite__updateStyle(__vite__id, __vite__css)',
        'import.meta.hot.accept()',
        'import.meta.hot.prune(() => __vite__removeStyle(__vite__id))'
      ].join('\n')
    }
    return {
      code,
      isAssets
    }
  }
 
  return function stylexDevMiddleware(req, res, next) {
    const protocol = 'encrypted' in (req?.socket ?? {}) ? 'https' : 'http'
    const { host } = req.headers
    const url = new URL(req.originalUrl, `${protocol}://${host}`)
    if (url.pathname.includes('vite-plugin:stylex')) {
      const module = viteServer.moduleGraph.getModuleById(VIRTUAL_STYLEX_CSS_MODULE)
      const { code, isAssets } = handleModule(module, url.pathname, req.headers?.accept ?? '')
      res.setHeader('Content-Type', isAssets ? 'text/css' : 'application/javascript')
      res.setHeader('x-powered-by', 'vite-plugin-stylex-dev')
      res.end(code)
    } else {
      next()
    }
  }
}

function patchOptmizeDepsExcludeId(id: string) {
  const { ext, dir, name } = path.parse(id)
  if (ext.includes('?')) {
    const extension = ext.split('?')[0]
    return path.join(dir, name + extension)
  }
  return id
}

function hijackTransformHook(plugin: Plugin, 
  before: (id: string) => Promise<string | void>,
  handler: (ctx: RollupPluginContext, id: string, chunk: TransformResult) => void) {
  const hook = plugin.transform
  if (typeof hook === 'function') {
    plugin.transform = async function (this, ...args: any) {
      const code = await before(args[1])
      if (code) {
        args[0] = code
      }
      const result = await hook.apply(this, args)
      handler(this, args[1], result)
      return result
    }
  }
}

export function stylexPlugin(opts: StylexPluginOptions = {}): Plugin {
  const {
    useCSSLayers = false,
    babelConfig: { plugins = [], presets = [] } = {},
    importSources = ['stylex', '@stylexjs/stylex'],
    include = /\.(mjs|js|ts|vue|jsx|tsx)(\?.*|)$/,
    exclude,
    optimizedDeps = [],
    manullayControlCssOrder = false,
    ...options
  } = opts
  const filter = createFilter(include, exclude)
  let stylexRules: Record<string, Rule[]> = {}
  let isProd = false
  let viteServer: ViteDevServer | null = null
  const viteCSSPlugins: Plugin[] = []
  const processStylexRules = () => {
    const rules = Object.values(stylexRules).flat().filter(Boolean)
    if (!rules.length) return
    return stylexBabelPlugin.processStylexRules(rules, useCSSLayers)
  }
  init.then()
  let patchAlias: ReturnType<typeof createPatchAlias>
  const controlCSSByManually: ManuallyControlCssOrder = Object.create(null)
  let isManuallyCSS = false

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
      // Reset the order of the middlewares
      return () => {
        // I think the middleware won't be only at ssr or custom render
        // It should be a normally middleware in development mode.
        // Hijack the request and do hmr.
        const stylexDevMiddleware = createStylexDevMiddleware({
          viteServer
        })
        viteServer.middlewares.use(stylexDevMiddleware)
        const order = viteServer.middlewares.stack.findIndex(m => {
          if (typeof m.handle === 'function') return m.handle.name === VITE_TRANSFORM_MIDDLEWARE_NAME
          return -1
        })
        const middleware = viteServer.middlewares.stack.pop()
        viteServer.middlewares.stack.splice(order, 0, middleware)
      }
    },
    configResolved(conf) {
      const root = searchForWorkspaceRoot(conf.root)
      if (!options.unstable_moduleResolution) {
        options.unstable_moduleResolution = { type: 'commonJS', rootDir: root }
      }
      isProd = conf.mode === 'production' || conf.env.mode === 'production'
      if (Array.isArray(optimizedDeps)) {
        optimizedDeps.push(...importSources.map(s => typeof s === 'object' ? s.from : s))
      }
      if (!isProd) {
        conf.optimizeDeps.exclude = [...optimizedDeps, ...(conf.optimizeDeps.exclude ?? []), '@stylexjs/open-props']
      }
      // we think custom always is ssr
      if (conf.appType === 'custom') {
        conf.ssr.noExternal = Array.isArray(conf.ssr.noExternal)
          ? [...conf.ssr.noExternal, ...optimizedDeps, '@stylexjs/open-props']
          : conf.ssr.noExternal
      }
      viteCSSPlugins.push(...conf.plugins.filter(p => VITE_INTERNAL_CSS_PLUGIN_NAMES.includes(p.name)))
      viteCSSPlugins.sort((a, b) => a.name === 'vite:css' && b.name === 'vite:css-post' ? -1 : 1)
      patchAlias = createPatchAlias({ parse, importSources })
      // hijack vite:css set the meta data for dev 
      if (!isProd && viteCSSPlugins[0]) {
        hijackTransformHook(viteCSSPlugins[0], async (id) => {
          const { original } = parseURLRequest(id)
          if (isManuallyCSS && original === controlCSSByManually.id) {
            let code = await fsp.readFile(original, 'utf8')
            code = code.replace(controlCSSByManually.symbol, processStylexRules())
            return code
          }
        }, (_, id, chunk) => {
          if (id !== VIRTUAL_STYLEX_CSS_MODULE) return
          if (chunk?.code) {
            const module = viteServer.moduleGraph.getModuleById(VIRTUAL_STYLEX_CSS_MODULE)
            if (module) {
              Object.defineProperty(module, '__stylex__', {
                value: chunk.code,
                writable: false,
                configurable: true
              })
            }
          }
        })
      }
      if (typeof manullayControlCssOrder === 'boolean' && manullayControlCssOrder) {
        Object.assign(controlCSSByManually, defaultControlCSSOptions)
      }
      if (typeof manullayControlCssOrder === 'object') {
        Object.assign(controlCSSByManually, defaultControlCSSOptions, manullayControlCssOrder)
      }
      if (controlCSSByManually?.id) {
        isManuallyCSS = true
        controlCSSByManually.id = path.isAbsolute(controlCSSByManually.id) 
          ? controlCSSByManually.id
          : path.join(root, controlCSSByManually.id)
      }
    },
    load(id) {
      if (id === VIRTUAL_STYLEX_CSS_MODULE) {
        return processStylexRules()
      }
    },
    resolveId(id) {
      if (id === VIRTUAL_STYLEX_MODULE) return VIRTUAL_STYLEX_CSS_MODULE
      // For waku
      if (id === VIRTUAL_STYLEX_CSS_MODULE_ALIAS) return VIRTUAL_STYLEX_CSS_MODULE
    },
    async transform(inputCode, id) {
      if (!filter(id)) return
      if (id.startsWith('\0')) return
      let skip = true
      const [imports] = await parse(inputCode)
      for (const stmt of imports) {
        if (stmt.n && importSources.some(i => !path.isAbsolute(stmt.n) && stmt.n.includes(typeof i === 'string' ? i : i.from))) {
          skip = false
          break
        }
      }
      if (skip) return
      // TODO for some reason stylex only process filename that contains `xx.style.ext` but vite will process all
      // of chunks in development mode. So we need hack it.
      id = patchOptmizeDepsExcludeId(id)
      inputCode = await patchAlias(inputCode, id, this)
      // stylex v0.5.0 respected dev
      const result = await transformStylex(inputCode, id, { dev: !isProd, plugins, presets, importSources, ...options })
      if (!result) return
      if ('stylex' in result.metadata) {
        const rules = result.metadata.stylex as Rule[]
        // #10 If user pass empty styles we should return the paased result.
        if (!rules.length) return { code: result.code, map: result.map }
        // pipe to vite's internal plugin for processing.
        if (!isManuallyCSS) {
          result.code = `import ${JSON.stringify(VIRTUAL_STYLEX_MODULE)};\n${result.code}`
        }
        stylexRules[id] = rules
      }
      if (viteServer) {
        const { moduleGraph } = viteServer
        const virtualModule = moduleGraph.getModuleById(VIRTUAL_STYLEX_CSS_MODULE)
        if (virtualModule) {
          moduleGraph.invalidateModule(virtualModule, new Set())
          virtualModule.lastHMRTimestamp = Date.now()
        }
        if (isManuallyCSS) {
          const cssModules = moduleGraph.getModulesByFile(controlCSSByManually.id)
          if (cssModules) {
            for (const module of cssModules) {
              await viteServer.reloadModule(module)
            }
          }
        }
      }
      return {
        code: result.code,
        map: result.map,
        meta: result.metadata
      }
    },
    async renderChunk(chunkCode, chunk) {
      // plugin_1 is vite:css plugin using it we will re set the finally css (Vite using prost-css in here.)
      // plugin_2 is vite:css-post plugin. vite will compress css here.
      const [plugin_1, plugin_2] = viteCSSPlugins
      if (isManuallyCSS) {
        let moduleId = controlCSSByManually.id
        for (const id of chunk.moduleIds) {
          const { original } = parseURLRequest(id)
          if (original === controlCSSByManually.id) {
            moduleId = id
            break
          }
        }
        if (moduleId in chunk.modules) {
          let code = await fsp.readFile(controlCSSByManually.id, 'utf8')
          code = code.replace(controlCSSByManually.symbol, processStylexRules())
          if (typeof plugin_1.transform === 'function' && typeof plugin_2.transform === 'function') {
            const { code: css } = await plugin_1.transform.call(this, code, controlCSSByManually.id)
            await plugin_2.transform.call(this, css, controlCSSByManually.id)
          }
          if (moduleId !== controlCSSByManually.id) {
            chunk.modules[controlCSSByManually.id] = chunk.modules[moduleId]
            delete chunk.modules[moduleId]
          }
        }
        return
      }

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

export { StylexPluginOptions }
