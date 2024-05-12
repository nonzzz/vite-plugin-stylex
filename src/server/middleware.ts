import path from 'path'
import type { ViteDevServer } from 'vite'
import type { NextHandleFunction } from 'connect'
import { slash } from '../shared'
import { DEFINE } from '../core'
import { StateContext } from '../core/state-context'
import { parseURLRequest } from '../core/manually-order'

interface StylexDevMiddlewareOptions {
  viteServer: ViteDevServer,
  context: StateContext
}

declare module 'vite' {
  export interface ModuleNode {
    __stylex__?: string
  }

}

const VALID_ID_PREFIX = '/@id/'

const VITE_HMR_APIS = ['createHotContext', 'updateStyle', 'removeStyle']

export function createStylexDevMiddleware(options: StylexDevMiddlewareOptions): NextHandleFunction {
  const { viteServer, context } = options
  const { moduleGraph } = viteServer
  const cssId = slash(context.isManuallyControlCSS
    ? context.controlCSSByManually.id!
    : DEFINE.MODULE_CSS)
  const pass = context.isManuallyControlCSS ? slash('/' + path.relative(context.root, cssId)) : cssId
  // path.relative(context.root, context.controlCSSByManually.id!)
  // const handleModule = (module: ModuleNode, pathName: string, accept = '') => {
  //   const isAssets = accept.includes('text/css')
  //   const paths = pathName.split('/')
  //   paths.pop()
  //   let base = ''
  //   const filter = paths.filter(p => !['@id', '@fs'].includes(p))
  //   base = filter.join('/')
  //   if (!base) base = '/'
  //   let code = ''
  //   // @ts-expect-error
  //   const css = module.__stylex__ || context.processCSS()
  //   if (isAssets) {
  //     code = css
  //   } else {
  //     code = [
  //       `import {createHotContext as __vite__createHotContext} from ${JSON.stringify(path.posix.join(base, '@vite/client'))};`,
  //       'import.meta.hot = __vite__createHotContext("/@id/@stylex-dev.css");',
  //       `import {updateStyle as __vite__updateStyle,removeStyle as __vite__removeStyle} from ${JSON.stringify(path.posix.join(base, '@vite/client'))};`,
  //       'const __vite__id = "@stylex-dev.css"',
  //       `const __vite__css = ${JSON.stringify(css)}`,
  //       '__vite__updateStyle(__vite__id, __vite__css)',
  //       'import.meta.hot.accept()',
  //       'import.meta.hot.prune(() => __vite__removeStyle(__vite__id))'
  //     ].join('\n')
  //   }
  //   return {
  //     code,
  //     isAssets
  //   }
  // }

  const pickupModule = (id: string) => {
    if (context.isManuallyControlCSS) {
      const modules = moduleGraph.getModulesByFile(id)!
      for (const module of modules) {
        if (parseURLRequest(module.url).original === pass) {
          return module
        }
      }
    }
    return moduleGraph.getModuleById(id)!
  }
  
  // we define a placeholder to tell vite should hmr the final css code.
  const handleModule = (pathName: string, isAssets: boolean) => {
    const cssModule = pickupModule(cssId)
    console.log(cssModule.transformResult?.code)
    const css = cssModule?.__stylex__ || context.processCSS()
    if (isAssets) {
      return css
    }
    // _nuxt/@id/__x00__vite-plugin:stylex.css
    const importSpecifers = VITE_HMR_APIS.map(api => api + ' as __vite__' + api)
    const hmr = [
      `import { ${importSpecifers.join(',')} } from "/@vite/client";`,
      `import.meta.hot = __vite__createHotContext(${JSON.stringify(pathName)});`,
      `const __vite__id = ${JSON.stringify(cssId)}`,
      `const __vite__css = ${JSON.stringify(css)}`,
      '__vite__updateStyle(__vite__id, __vite__css)',
      'import.meta.hot.accept()',
      'import.meta.hot.prune(() => __vite__removeStyle(__vite__id))'
    ].join('\n')
    return hmr
  }

  // https://github.com/vitejs/vite/blob/main/packages/vite/src/node/plugins/importAnalysis.ts#L351
  const ensurePass = (url: string) => {
    if (url.startsWith(VALID_ID_PREFIX)) {
      url = url.slice(VALID_ID_PREFIX.length)
    }
    return url === pass
  }
 
  return function stylexDevMiddleware(req, res, next) {
    const protocol = 'encrypted' in (req?.socket ?? {}) ? 'https' : 'http'
    const { host } = req.headers
    // @ts-ignore
    const url = new URL(req.originalUrl, `${protocol}://${host}`)
    if (ensurePass(url.pathname)) {
      const isAssets = !!req.headers.accept?.includes('text/css')
      const code = handleModule(url.pathname, isAssets)
      res.writeHead(200, {
        'Content-Type': isAssets ? 'text/css' : 'application/javascript',
        'x-powered-by': 'vite-plugin-stylex-dev'
      })
      res.end(code)
    } else {
      next()
    }
  }
}
