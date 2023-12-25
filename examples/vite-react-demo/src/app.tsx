import * as stylex from '@stylexjs/stylex'

import { colors } from '@stylexjs/open-props/lib/colors.stylex'

const styles = stylex.create({
  base: {
    color: colors.gray0
  }
})

function App() {
  return <button type="button" {...stylex.props(styles.base)}>Click me!</button>
}

export { App }
