import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  foo: {
    fontSize: '16px'
  }
})

const { className } = stylex.props(styles.foo)

export { className }
