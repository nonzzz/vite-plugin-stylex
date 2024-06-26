import path from 'path'
import child_porcess from 'child_process'
import net from 'net'
import { chromium } from 'playwright'

export async function createChromeBrowser(port: number) {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const localURL = `http://localhost:${port}`
  page.goto(localURL)
  return { page, browser }
}

// I don't know why vite don't accept port 0
export function genRandomPort() {
  const minPort = 5173
  const maxPort = 49151
  return Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort
}

export async function createE2EServer(taskName: string, mode = 'development') {
  const configFile = path.join(__dirname, 'fixtures', taskName, 'vite.config.mts')
  const { createServer } = await import('vite')
  const server = await createServer({
    configFile,
    server: {
      port: genRandomPort()
    },
    root: path.join(__dirname, 'fixtures', taskName),
    mode
  })
  await server.listen()
  const { page, browser } = await createChromeBrowser(server.config.server.port!)
  return { page, server, browser }
}

function waitForPort(port: number, host = 'localhost', timeout = 30000) {
  const startTime = Date.now()
  return new Promise((resolve, reject) => {
    const check = () => {
      const client = new net.Socket()
      client.once('connect', () => {
        client.end()
        resolve(true)
      }).once('error', (err) => {
        if (Date.now() - startTime > timeout) {
          reject(err)
        } else {
          setTimeout(check, 100) // Retry after 100ms
        }
      })
        .connect(port, host)
    }
    check()
  })
}

export async function createWakuE2EServer(port = genRandomPort()) {
  // waku don't expose cli so we should get the cli entry by two step
  const wakuPoint = require.resolve('waku', { paths: [__dirname] })
  const waku = path.join(path.dirname(wakuPoint), 'cli.js')
  const cp = child_porcess.exec(`node ${waku} dev --port ${port}`, { cwd: path.join(__dirname, 'fixtures', 'waku') })
  await waitForPort(port)
  const { page, browser } = await createChromeBrowser(port)
  console.log(`http://localhost:${port}`)
  return { cp, page, browser }
}
