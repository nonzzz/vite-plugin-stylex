import path from 'path'
import { createFilter, searchForWorkspaceRoot } from 'vite'
import stylexBabelPlugin from '@stylexjs/babel-plugin'
import flowSyntaxPlugin from '@babel/plugin-syntax-flow'
import jsxSyntaxPlugin from '@babel/plugin-syntax-jsx'
import typescriptSyntaxPlugin from '@babel/plugin-syntax-typescript'
import type { NextHandleFunction } from 'connect'
import * as babel from '@babel/core'
import type { ModuleNode, Plugin, ViteDevServer } from 'vite'
import type { Rule } from '@stylexjs/babel-plugin'
import type { StylexPluginOptions, TransformStylexOptions } from './interface'
import { createPatchAlias } from './patch-alias'

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
  processer: () => string,
  viteServer: ViteDevServer,
  custom: boolean
}

function createStylexDevMiddleware(options: StylexDevMiddlewareOptions): NextHandleFunction {
  const { processer, viteServer, custom } = options

  const handleModule = (module: ModuleNode, pathName: string, accept = '') => {
    const isAssets = accept.includes('text/css')
    const paths = pathName.split('/')
    paths.pop()
    let base = ''
    const filter = paths.filter(p => !['@id', '@fs'].includes(p))
    base = filter.join('/')
    if (!base) base = '/'
    let code = ''
    if (isAssets) {
      code = processer()
    } else {
      if (custom) {
        code = [
          `import {createHotContext as __vite__createHotContext} from ${JSON.stringify(path.posix.join(base, '@vite/client'))};`,
          'import.meta.hot = __vite__createHotContext("/@id/__x00__vite-plugin:stylex.css");',
          `import {updateStyle as __vite__updateStyle,removeStyle as __vite__removeStyle} from ${JSON.stringify(path.posix.join(base, '@vite/client'))};`,
          'const __vite__id = "\u0000vite-plugin:stylex.css"',
          `const __vite__css = ${JSON.stringify(processer())}`,
          '__vite__updateStyle(__vite__id, __vite__css)',
          'import.meta.hot.accept()',
          'import.meta.hot.prune(() => __vite__removeStyle(__vite__id))'
        ].join('\n')
      } else {
        code = module.transformResult?.code 
      }
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

export function stylexPlugin(opts: StylexPluginOptions = {}): Plugin {
  const {
    useCSSLayers = false,
    babelConfig: { plugins = [], presets = [] } = {},
    importSources = ['stylex', '@stylexjs/stylex'],
    include = /\.(mjs|js|ts|vue|jsx|tsx)(\?.*|)$/,
    exclude,
    ...options
  } = opts
  const filter = createFilter(include, exclude)
  let stylexRules: Record<string, Rule[]> = {}
  let isProd = false
  // I think custom render in most of time is ssr so that we should disable stylex runtime inejct.
  let isCustomRender = false
  let viteServer: ViteDevServer | null = null
  const viteCSSPlugins: Plugin[] = []
  const processStylexRules = () => {
    const rules = Object.values(stylexRules).flat()
    if (!rules.length) return
    return stylexBabelPlugin.processStylexRules(rules, useCSSLayers)
  }

  let patchAlias: ReturnType<typeof createPatchAlias>

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
          processer: processStylexRules,
          viteServer,
          custom: isCustomRender
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
      if (!options.unstable_moduleResolution) {
        options.unstable_moduleResolution = { type: 'commonJS', rootDir: searchForWorkspaceRoot(conf.root) }
      }
      isProd = conf.mode === 'production' || conf.env.mode === 'production'
      isCustomRender = conf.appType === 'custom' || conf.server.middlewareMode
      if (!isProd) {
        conf.optimizeDeps.exclude = [...(conf.optimizeDeps.exclude ?? []), '@stylexjs/open-props']
      }
      viteCSSPlugins.push(...conf.plugins.filter(p => VITE_INTERNAL_CSS_PLUGIN_NAMES.includes(p.name)))
      viteCSSPlugins.sort((a, b) => a.name === 'vite:css' && b.name === 'vite:css-post' ? -1 : 1)
      const tsconfigPaths = conf.plugins.find(p => p.name === 'vite-tsconfig-paths')
      patchAlias = createPatchAlias(conf.resolve.alias, { tsconfigPaths })
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
      if (id.startsWith('\0') || id.includes('virtaul:nuxt')) return
      if (!importSources.some((stmt) => inputCode.includes(typeof stmt === 'string' ? stmt : stmt.from))) return
      // TODO for some reason stylex only process filename that contains `xx.style.ext` but vite will process all
      // of chunks in development mode. So we need hack it.
      id = patchOptmizeDepsExcludeId(id)
      inputCode = await patchAlias(inputCode, id, this)
      
      const result = await transformStylex(inputCode, id, { dev: isCustomRender ? false : !isProd, plugins, presets, ...options })
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

export { StylexPluginOptions }
