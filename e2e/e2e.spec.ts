import path from 'path'
import test from 'ava'
import type { ExecutionContext } from 'ava'
import { Page } from 'playwright'
import { createE2EServer } from './helper'

import { createSSRServer } from './fixtures/vue-ssr/server'

async function fixtureSwitchColor(page: Page, t: ExecutionContext<unknown>) {
  await page.waitForLoadState('domcontentloaded')
  const element = await page.waitForSelector('div[role="button"]')
  const before = await element.getAttribute('class')
  await element.click()
  const after = await element.getAttribute('class')
  t.not(before, after)
  await element.click()
  t.is(before, await element.getAttribute('class'))
}

test('spa', async (t) => {
  const { page } = await createE2EServer('spa')
  await fixtureSwitchColor(page, t)
})

test('vue ssr', async (t) => {
  const { page } = await createSSRServer(path.join(__dirname, 'fixtures', 'vue-ssr', 'vite.config.mts'))
  await fixtureSwitchColor(page, t)
})
