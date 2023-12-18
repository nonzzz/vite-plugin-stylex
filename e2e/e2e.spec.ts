import path from 'path'
import test from 'ava'
import { createE2EServer } from './helper'
import { createSSRServer } from './fixtures/vue-ssr/server'

// FIXME 
// I don't know why remix can't inject it self virtual module by node api (But it can work well by cli)
// I guessing remix doesn't respect root.
test('fixture remix', async (t) => {
  const { page } = await createE2EServer('remix')
  await new Promise((resolve) => setTimeout(resolve, 5000)) 
  await page.waitForSelector('div[role="button"]')
  const elementHandle = await page.$('div[role="button"]')
  const windowHandle = await page.evaluateHandle(() => Promise.resolve(window))
  const red = await page.evaluate(([window, el]) => {
    return (window as Window).getComputedStyle(el as Element).color
  }, [windowHandle, elementHandle])
  t.is(red, 'rgb(255, 0, 0)', 'first load spa button text color should be red')
  await elementHandle.click()
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const blue = await page.evaluate(([window, el]) => {
    return (window as Window).getComputedStyle(el as Element).color
  }, [windowHandle, elementHandle])
  t.is(blue, 'rgb(0, 0, 255)', 'tap button and text color should be blue')
})

test('fixture spa', async (t) => {
  const { page } = await createE2EServer('spa')
  await page.waitForSelector('div[role="button"]')
  const elementHandle = await page.$('div[role="button"]')
  const windowHandle = await page.evaluateHandle(() => Promise.resolve(window))
  const red = await page.evaluate(([window, el]) => {
    return (window as Window).getComputedStyle(el as Element).color
  }, [windowHandle, elementHandle])
  t.is(red, 'rgb(255, 0, 0)', 'first load spa button text color should be red')
  await elementHandle.click()
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const blue = await page.evaluate(([window, el]) => {
    return (window as Window).getComputedStyle(el as Element).color
  }, [windowHandle, elementHandle])
  t.is(blue, 'rgb(0, 0, 255)', 'tap button and text color should be blue')
})

test('fixture qwik', async (t) => {
  const { page } = await createE2EServer('qwik')
  await page.waitForSelector('div[role="button"]')
  const elementHandle = await page.$('div[role="button"]')
  const windowHandle = await page.evaluateHandle(() => Promise.resolve(window))
  const red = await page.evaluate(([window, el]) => {
    return (window as Window).getComputedStyle(el as Element).color
  }, [windowHandle, elementHandle])
  t.is(red, 'rgb(255, 0, 0)', 'first load spa button text color should be red')
  await elementHandle.click()
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const blue = await page.evaluate(([window, el]) => {
    return (window as Window).getComputedStyle(el as Element).color
  }, [windowHandle, elementHandle])
  t.is(blue, 'rgb(0, 0, 255)', 'tap button and text color should be blue')
})

test('fixture vue ssr', async (t) => {
  const { page } = await createSSRServer(path.join(__dirname, 'fixtures', 'vue-ssr', 'vite.config.mts'))
  await new Promise((resolve) => setTimeout(resolve, 5000)) 
  await page.waitForSelector('div[role="button"]')
  const elementHandle = await page.$('div[role="button"]')
  const windowHandle = await page.evaluateHandle(() => Promise.resolve(window))
  const red = await page.evaluate(([window, el]) => {
    return (window as Window).getComputedStyle(el as Element).color
  }, [windowHandle, elementHandle])
  t.is(red, 'rgb(255, 0, 0)', 'first load spa button text color should be red')
  await elementHandle.click()
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const blue = await page.evaluate(([window, el]) => {
    return (window as Window).getComputedStyle(el as Element).color
  }, [windowHandle, elementHandle])
  t.is(blue, 'rgb(0, 0, 255)', 'tap button and text color should be blue')
})
