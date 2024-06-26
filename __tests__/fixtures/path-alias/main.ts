import { create, props } from '@stylexjs/stylex'
import { colors } from '@/tokens/color.stylex'
import 'virtual:stylex.css'

const styles = create({
  black: {
    color: colors.black
  }
})

const { className } = props(styles.black)

export { className }
