import { $, component$, useSignal } from '@builder.io/qwik'
import type { DocumentHead } from '@builder.io/qwik-city'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  text: { fontSize: '20px', cursor: 'pointer' },
  blue: {
    color: 'blue'
  },
  red: {
    color: 'red'
  }
})

export default component$(() => {
  const color = useSignal('red')
   
  const handleClick = $(() => {
    color.value = color.value === 'red' ? 'blue' : 'red'
  })
  return (
    <div>
      <div role="button" onClick$={handleClick} class={stylex.props(styles.text, color.value === 'red' ? styles.red : styles.blue).className}>Action</div>
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
