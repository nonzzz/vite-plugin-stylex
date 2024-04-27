import path from 'path'
import test from 'ava'
import type { UserConfig } from 'vite'
import { stylex } from '../src'
import type { StylexPluginOptions } from '../src'

interface BuildOptions {
  stylex?: StylexPluginOptions
  vite?: UserConfig
}

async function build(fixture: string, opts: BuildOptions = {}) {
  const { stylex: stylexOptions = {}, vite: viteOptions = {} } = opts
  const basePath = path.join(__dirname, 'fixtures', fixture)
  const { build, mergeConfig } = await import('vite')
  const bundle = await build(mergeConfig({
    build: {
      lib: {
        entry: path.join(basePath, 'main.ts'),
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
    plugins: [...(viteOptions.plugins ?? []), stylex(stylexOptions)],
    logeLevel: 'silent'
  }, viteOptions))
  if (Array.isArray(bundle)) {
    const chunks = bundle[0].output.filter(s => s.fileName === 'style.css' || s.fileName === 'bundle.mjs')
    chunks.sort((a, b) => a.fileName.endsWith('.css') && !b.fileName.endsWith('.css') ? -1 : 1)
    return chunks.map(s => s.type === 'asset' ? s.source : s.code)
  }
  throw new Error(`Build failed with ${fixture}`)
}

test('normal', async (t) => {
  const [css, js] = await build('normal', { vite: { build: { cssMinify: false } } })
  t.snapshot(css)
  t.snapshot(js)
  const [css_1] = await build('normal')
  t.snapshot(css_1)
})

test('postcss', async (t) => {
  const [css] = await build('pxtorem', { vite: {
    css: {
      postcss: {
        plugins: [(await import('postcss-pxtorem')).default]
      }
    }
  } })
  t.snapshot(css)
})

test('lightning css', async (t) => {
  const [css] = await build('lightning-css', {
    vite: {
      css: {
        transformer: 'lightningcss',
        lightningcss: {
          drafts: {
            customMedia: true
          }
        }
      }
    },
    stylex: {
      manuallyControlCssOrder: {
        id: path.join(__dirname, 'fixtures', 'lightning-css', 'style.css')
      }
    }
  })
  t.snapshot(css)
})

test('aliases', async (t) => {
  const [css] = await build('path-alias', {
    vite: {
      plugins: [(await import('vite-tsconfig-paths')).default({ root: path.join(__dirname, 'fixtures', 'path-alias') })]
    }
  })
  t.snapshot(css)
})

test('ts config paths', async (t) => {
  const [css] = await build('path-alias', {
    vite: {
      resolve: {
        alias: {
          '@': './'
        }
      },
      build: {
        minify: false
      }
    }
  })
  t.snapshot(css)
})

test('empty', async (t) => {
  const [css] = await build('empty')
  t.snapshot(css)
})
