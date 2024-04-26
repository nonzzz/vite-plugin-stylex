import fs from 'fs/promises'
import path from 'path'
import express from 'express'
import { createChromeBrowser, genRandomPort } from '../../helper'

export async function createSSRServer(configFile = path.join(__dirname, 'vite.config.mts')) {
  const app = express()
  const { createServer } = await import('vite')

  const viteServer = await createServer({ configFile, server: { middlewareMode: true }, appType: 'custom', base: '/', root: __dirname })
  app.use(viteServer.middlewares)
  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl.replace('/', '')
      let template = await fs.readFile(path.join(__dirname, 'index.html'), 'utf8')
      template = await viteServer.transformIndexHtml(url, template)
      const { render } = await viteServer.ssrLoadModule('/src/entry-server.ts')
      const rendered = await render(url)
      const html = template
        .replace('<!--app-head-->', rendered.head ?? '')
        .replace('<!--app-html-->', rendered.html ?? '')
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (error: any) {
      viteServer.ssrFixStacktrace(error)
      res.status(500).end(error.stack)
    }
  })
  const port = genRandomPort()
  app.listen(port)
  const { page } = await createChromeBrowser(port)
  return { app, page, port }
}

if (require.main === module) {
  createSSRServer().then(({ port }) => console.log(`server listen on: http://127.0.0.1:${port}`))
}
