import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from '@remix-run/react'

import type { LinksFunction } from '@remix-run/node'
import * as stylex from '@stylexjs/stylex'

import { colors } from './styles/color.stylex'
import $styles from './styles/index.css?url'

// import './styles/index.css'

export const links: LinksFunction = () => [
  { rel: 'preload', href: $styles, as: 'style' },
  { rel: 'stylesheet', href: $styles }
]

export const styles = stylex.create({
  body: {
    color: colors.accentA2
  }
})

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
