import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from '@remix-run/react'

import type { LinksFunction } from '@remix-run/node'
import * as stylex from '@stylexjs/stylex'

import $styles from './styles/index.css?url'
import { colors } from './styles/color.stylex'

export const links: LinksFunction = () => [
  { rel: 'preload', href: $styles, as: 'style' },
  { rel: 'stylesheet', href: $styles }
]

export const styles = stylex.create({
  body: {
    color: colors.foreground
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
