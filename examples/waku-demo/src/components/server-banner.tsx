'use strict'

import { create, props } from '@stylexjs/stylex'

import '@stylex-dev.css'

const styles = create({
  root: {
    backgroundColor: 'pink',
    color: '#fff',
    padding: '20px',
    textAlign: 'center'
  }
})

export const ServerBanner = () => {
  return <div {...props(styles.root)}>This is a server banner by StyleX CSS</div>
}
