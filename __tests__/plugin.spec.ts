import path from 'path'
import test from 'ava'
import type { UserConfig } from 'vite'
import { stylexPlugin } from '../src'
import type { StylexPluginOptions } from '../src'

function sleep(delay = 1000) {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

interface BuildOptions {
  stylex?: StylexPluginOptions
  vite?: UserConfig
}

async function mockBuild(taskName: string, opts: BuildOptions = {}) {
  const { stylex = {}, vite: viteOptions = {} } = opts
  const vite = await import('vite')
  const bundle = await vite.build(vite.mergeConfig({
    build: {
      lib: {
        entry: path.join(__dirname, 'fixtures', taskName, 'main.ts'),
        formats: ['es'],
        fileName: 'bundle'
      },
      rollupOptions: {
        output: {
          assetFileNames: 'style.[ext]'
        },
        external: ['@stylexjs/stylex'],
        ...viteOptions?.build?.rollupOptions
      },
      ...viteOptions?.build,
      write: false
    },
    plugins: [stylexPlugin(stylex)],
    logLevel: 'silent'
  }, viteOptions))
  let css = ''
  let js = ''
  for (const chunkOrAsset of bundle[0].output) {
    if (chunkOrAsset.fileName === 'style.css') {
      css = chunkOrAsset.source
    } else if (chunkOrAsset.fileName === 'bundle.mjs') {
      js = chunkOrAsset.code
    }
  }
  return { css, js }
}

// Currently, i can't find a good way to write unit test case.
// So this test file only test build case
// I think most dev related scenarios should be executed in e2e.

test('normal suit disable css minify', async (t) => {
  const { css, js } = await mockBuild('normal', { vite: { build: { cssMinify: false } } })
  await sleep()
  t.is(css, `.xju2f9n{color:blue}
.x1e2nbdu{color:red}`)
  t.is(js, `import * as s from "@stylexjs/stylex";
const e = {
  blue: {
    color: "xju2f9n",
    $$css: !0
  }
}, o = {
  red: {
    color: "x1e2nbdu",
    $$css: !0
  }
}, { className: r } = s.props(e.blue, o.red);
export {
  r as className
};
`)
})

test('normal suite enable css minify', async (t) => {
  const { css } = await mockBuild('normal')
  await sleep()
  t.is(css, '.xju2f9n{color:#00f}.x1e2nbdu{color:red}\n')
})

test('pxtorem suite should transform px to rem', async (t) => {
  const { css } = await mockBuild('pxtorem', { vite: {
    css: { 
      postcss: {
        plugins: [(await import('postcss-pxtorem')).default]
      } 
    }
  } })
  await sleep()
  t.is(css, '.x1j61zf2{font-size:1rem}\n')
})

test('path-alias suite should be work', async (t) => {
  const { js } = await mockBuild('path-alias', 
    { vite: 
      { 
        resolve: {
          alias: {
            '@': '.'
          }
        },
        build: {
          minify: false
        }
      }
    })
  await sleep()
  t.is(js, `import { defineVars, create, props } from "@stylexjs/stylex";
const colors = defineVars({
  black: "#000"
});
const styles = create({
  black: {
    color: colors.black
  }
});
const { className } = props(styles.black);
export {
  className
};
`)
})
