import path from 'path'
import test from 'ava'
import type { ExecutionContext } from 'ava'
import { Page } from 'playwright'
import { createE2EServer } from './helper'

import { createSSRServer } from './fixtures/vue-ssr/server'

async function fixtureSwitchColor(page: Page, t: ExecutionContext<unknown>) {
  await page.waitForSelector('div[role="button"]')
  const elementHandle = await page.$('div[role="button"]')
  const windowHandle = await page.evaluateHandle(() => Promise.resolve(window))
  const red = await page.evaluate(([window, el]) => {
    return (window as Window).getComputedStyle(el as Element).color
  }, [windowHandle, elementHandle])
  t.is(red, 'rgb(255, 0, 0)')
  await elementHandle?.click()
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const blue = await page.evaluate(([window, el]) => {
    return (window as Window).getComputedStyle(el as Element).color
  }, [windowHandle, elementHandle])
  t.is(blue, 'rgb(0, 0, 255)')
}

test('spa', async (t) => {
  const { page } = await createE2EServer('spa')
  await fixtureSwitchColor(page, t)
})

test('vue ssr', async (t) => {
  const { page } = await createSSRServer(path.join(__dirname, 'fixtures', 'vue-ssr', 'vite.config.mts'))
  await fixtureSwitchColor(page, t)
})

test('remix', async (t) => {
  const { page } = await createE2EServer('remix')
  await fixtureSwitchColor(page, t)
})
