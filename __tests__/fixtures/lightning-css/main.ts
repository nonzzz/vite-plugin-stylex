import { create, props } from '@stylexjs/stylex'
import './style.css'

const styles = create({
  layout: {
    color: {
      default: 'lch(from green calc(l + 10%) c h)',
      '@media (--mx-1)': 'purple'
    }

  }
})

export const cls = props(styles.layout)
