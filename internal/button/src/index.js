import { attrs, create } from '@stylexjs/stylex'

const style = create({
  button: {
    borderRadius: '20px',
    fontSize: 16,
    fontWeight: 400
  }
})

export class Button {
  render(text) {
    const button = document.createElement('button')
    const props = attrs(style.button)
    button.setAttribute('class', props.class)
    if (props.style) {
      button.setAttribute('style', props.style)
    }
    button.innerText = text
    document.documentElement.appendChild(button)
  }
}
