import * as stylex from '@stylexjs/stylex'
import 'virtual:stylex.css'

const styles = stylex.create({
  foo: {
    fontSize: '16px'
  }
})

const { className } = stylex.props(styles.foo)

export { className }
