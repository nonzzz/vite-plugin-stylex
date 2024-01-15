import { create, props } from '@stylexjs/stylex'

const styles = create({
  link: {
    padding: null
  }
})

const { className } = props(styles.link)

export { className }
