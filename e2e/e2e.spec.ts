import path from 'path'
import test from 'ava'
import { createE2EServer } from './helper'

test('fixture spa', async (t) => {
  const configFile = path.join(__dirname, 'fixtures', 'spa', 'vite.config.mts')
  const { page } = await createE2EServer(configFile)
  await page.waitForSelector('div[role="button"]')
  const elementHandle = await page.$('div[role="button"]')
  const windowHandle = await page.evaluateHandle(() => Promise.resolve(window))
  const red = page.evaluate(([window, el]) => {
    return (window as Window).getComputedStyle(el as Element).color
  }, [windowHandle, elementHandle])
  t.is(await red, 'rgb(255, 0, 0)', 'first load spa button text color should be red')
  await elementHandle.click()
  const blue = page.evaluate(([window, el]) => {
    return (window as Window).getComputedStyle(el as Element).color
  }, [windowHandle, elementHandle])
  t.is(await blue, 'rgb(0, 0, 255)', 'tap button and text color should be blue')
})
