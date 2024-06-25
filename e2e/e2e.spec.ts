import test from 'ava'
import type { ExecutionContext } from 'ava'
import { Page } from 'playwright'
import { createE2EServer } from './helper'

async function switchColor(t: ExecutionContext<unknown>, page: Page) {
  await page.waitForSelector('button')
  const elementHandle = await page.$('button')
  const textHandle = await page.$('#text')
  const windowHandle = await page.evaluateHandle(() => Promise.resolve(window))
  const red = await page.evaluate(([window, el]) => {
    return (window as Window).getComputedStyle(el as Element).color
  }, [windowHandle, textHandle])
  t.is(red, 'rgb(255, 0, 0)')
  await elementHandle!.click()
  const blue = await page.evaluate(([window, el]) => {
    return (window as Window).getComputedStyle(el as Element).color
  }, [windowHandle, textHandle])
  t.is(blue, 'rgb(0, 0, 255)')
}

test('vite-react-spa', async (t) => {
  const { page } = await createE2EServer('vite-react-spa')
  await switchColor(t, page)
})

// test('vite-vue-spa', async (t) => {
//   const { page } = await createE2EServer('vite-vue-spa')
//   await switchColor(t, page)
// })
