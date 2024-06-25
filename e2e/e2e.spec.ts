import test from 'ava'
import type { ExecutionContext } from 'ava'
import { Page } from 'playwright'
import { createE2EServer } from './helper'

function getColorText(s: string) {
  return s.match(/--color:(\w*);?/)?.[1]
}

async function switchColor(t: ExecutionContext<unknown>, page: Page) {
  await page.waitForSelector('button')
  const elementHandle = await page.$('button')
  const textHandle = await page.$('#text')
  const red = await textHandle?.getAttribute('style')!
  t.is(getColorText(red!), 'red')
  await elementHandle!.click()
  await page.waitForTimeout(1000)
  const blue = await textHandle?.getAttribute('style')!
  t.is(getColorText(blue!), 'blue')
}

test.serial('vite-react-spa', async (t) => {
  const { page, browser } = await createE2EServer('vite-react-spa')
  await switchColor(t, page)
  await browser.close()
})

test.serial('remix', async (t) => {
  const { page, browser } = await createE2EServer('remix')
  await switchColor(t, page)
  await browser.close()
})
