import { create, props } from '@stylexjs/stylex'
import 'virtual:stylex.css'

const styles = create({
  link: {
    padding: null
  }
})

const { className } = props(styles.link)

export { className }
