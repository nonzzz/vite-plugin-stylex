import path from 'path'
import { chromium } from 'playwright'
import type { ViteDevServer } from 'vite'

export async function createChromeBrowser(server: ViteDevServer) {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const localURL = `http://localhost:${server.config.server.port}`
  page.goto(localURL)
  return { page }
}

export async function createE2EServer(configFile: string) {
  const { createServer } = await import('vite')
  const server = await createServer({
    configFile,
    server: {
      port: 0
    },
    root: path.join(__dirname, 'fixtures', 'spa')
  })
  await server.listen()
  const { page } = await createChromeBrowser(server)
  return { page, server }
}
