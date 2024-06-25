import { $, component$, useSignal } from '@builder.io/qwik'
import type { DocumentHead } from '@builder.io/qwik-city'
import * as stylex from '@stylexjs/stylex'
import { inline } from '@stylex-extend/core'

export default component$(() => {
  const color = useSignal('red')

  const handleClick = $(() => {
    color.value = color.value === 'red' ? 'blue' : 'red'
  })
  return (
    <div>
      <h1
        id="text"
        {...stylex.props(inline({ color: color.value }))}
      >
        vite-plugin-stylex-dev
      </h1>
      <button type="button" onClick$={handleClick}>Change color</button>
    </div>
  )
})

export const head: DocumentHead = {
  title: 'Welcome to Qwik',
  meta: [
    {
      name: 'description',
      content: 'Qwik site description'
    }
  ]
}
