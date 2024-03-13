import { attrs, create } from '@stylexjs/stylex'

const style = create({
  text: {
    fontSize: 16,
    fontWeight: 400,
    border: '1px solid pink'
  }
})

exports.Text = class Text {
  render(text) {
    const p = document.createElement('p')
    const props = attrs(style.text)
    p.setAttribute('class', props.class)
    if (props.style) {
      p.setAttribute('style', props.style)
    }
    p.innerText = text
    document.documentElement.appendChild(p)
  }
}
