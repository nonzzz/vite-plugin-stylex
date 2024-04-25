import path from 'path'
import type { ModuleNode, ViteDevServer } from 'vite'
import type { NextHandleFunction } from 'connect'
import { DEFINE } from 'src/core'

interface StylexDevMiddlewareOptions {
  viteServer: ViteDevServer,
}

export function createStylexDevMiddleware(options: StylexDevMiddlewareOptions): NextHandleFunction {
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
        'const __vite__id = "\u0000@stylex-dev.css"',
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
    // @ts-ignore
    const url = new URL(req.originalUrl, `${protocol}://${host}`)
    if (url.pathname.includes('vite-plugin:stylex')) {
      const module = viteServer.moduleGraph.getModuleById(DEFINE.MODULE_CSS)!
      const { code, isAssets } = handleModule(module, url.pathname, req.headers?.accept ?? '')
      res.setHeader('Content-Type', isAssets ? 'text/css' : 'application/javascript')
      res.setHeader('x-powered-by', 'vite-plugin-stylex-dev')
      res.end(code)
    } else {
      next()
    }
  }
}
