'use strict'

import { create, props } from '@stylexjs/stylex'

const styles = create({
  root: {
    backgroundColor: 'purple',
    color: '#fff',
    padding: '20px',
    textAlign: 'center'
  }
})

export const ServerBanner = () => {
  return <div {...props(styles.root)}>This is a server banner by StyleX CSS</div>
}
