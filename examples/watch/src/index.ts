import { create, props } from '@stylexjs/stylex'
import { Text } from './text'
import './stylex.css'

const styles = create({
  text: {
    color: {
      default: 'red',
      '@media (--mx-1)': 'green'
    }
  }
})

export function Button() {
  const button = document.createElement('button')
  button.className = props(styles.text).className!
  return button
}

function render() {
  const button = Button()
  const text = Text()
  document.body.appendChild(button)
  document.body.appendChild(text)
}

render()
