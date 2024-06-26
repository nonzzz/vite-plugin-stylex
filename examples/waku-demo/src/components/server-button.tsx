'use strict'

import { create, props } from '@stylexjs/stylex'

import '@stylex-dev.css'

const styles = create({
  root: {
    backgroundColor: 'purple',
    color: '#fff',
    padding: '20px',
    textAlign: 'center'
  }
})

export const ServerButton = () => {
  return <button {...props(styles.root)}>This is a server banner by StyleX CSS</button>
}
