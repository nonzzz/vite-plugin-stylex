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

// I don't know thy vite don't accept port 0 
function genRandomPort() {
  const minPort = 5173
  const maxPort = 49151
  return Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort
}

export async function createE2EServer(taskName: string) {
  const configFile = path.join(__dirname, 'fixtures', taskName, 'vite.config.mts')
  const { createServer } = await import('vite')
  const server = await createServer({
    configFile,
    server: {
      port: genRandomPort()
    },
    root: path.join(__dirname, 'fixtures', taskName)
  })
  await server.listen()
  const { page } = await createChromeBrowser(server)
  return { page, server }
}
