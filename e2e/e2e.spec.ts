import { expect, test } from 'vitest'
import { Page } from 'playwright'
import { createE2EServer, createWakuE2EServer } from './helper'

function getColorText(s: string) {
  return s.match(/--color:(\w*);?/)?.[1]
}

async function switchColor(page: Page) {
  await page.waitForSelector('button')
  const elementHandle = await page.$('button')
  const textHandle = await page.$('#text')
  const red = await textHandle?.getAttribute('style')!
  expect(getColorText(red!)).toBe('red')
  await elementHandle!.click()
  await page.waitForTimeout(1000)
  const blue = await textHandle?.getAttribute('style')!
  expect(getColorText(blue!)).toBe('blue')
}

test('vite-react-spa', async () => {
  const { page, browser } = await createE2EServer('vite-react-spa')
  await switchColor(page)
  await browser.close()
})

test('vite-vue-spa', async () => {
  const { page, browser } = await createE2EServer('vite-vue-spa')
  await switchColor(page)
  await browser.close()
})

test('remix', async () => {
  const { page, browser } = await createE2EServer('remix')
  await switchColor(page)
  await browser.close()
})

test('waku', async () => {
  const { cp, page, browser } = await createWakuE2EServer()
  await switchColor(page)
  await browser.close()
  cp.kill('SIGTERM')
})

test('qwik', async () => {
  const { page, browser } = await createE2EServer('qwik', 'ssr')
  await switchColor(page)
  await browser.close()
})
