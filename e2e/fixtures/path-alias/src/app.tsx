/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import * as stylex from '@stylexjs/stylex'
import { useState } from 'react'
import { colors } from '@/themes/color.stylex'

const styles = stylex.create({
  text: { fontSize: '20px', cursor: 'pointer' },
  blue: {
    color: colors.blue
  },
  red: {
    color: colors.red
  }
})

export function App() {
  const [color, setColor] = useState('red')

  const handleClick = () => {
    setColor(pre => pre === 'red' ? 'blue' : 'red')
  }

  return (
    <div>
      <div role="button" onClick={handleClick} className={stylex.props(styles.text, color === 'red' ? styles.red : styles.blue).className}>Action</div>
    </div>
  )
}
