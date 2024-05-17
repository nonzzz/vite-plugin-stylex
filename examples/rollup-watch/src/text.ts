import { create, props } from '@stylexjs/stylex'
import { colors } from './var.stylex'

const styles = create({
  text: {
    color: colors.dark,
    fontSize: '10px'
  }
})

export function Text() {
  const button = document.createElement('div')
  const attrs = props(styles.text)
  button.className = attrs.className!
  button.setAttribute('style', attrs.style as unknown as string)
  return button
}
