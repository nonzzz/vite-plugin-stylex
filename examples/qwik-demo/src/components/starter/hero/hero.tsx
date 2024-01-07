import { component$ } from '@builder.io/qwik'

import stylex from '@stylexjs/stylex'

const s = stylex.create({
  h1: {
    color: 'yellow',
    fontStyle: 'italic'
  }
})

export default component$(() => {
  return (
    <div className="container">
      <h1 className={stylex.props(s.h1).className}>
        So 
        {' '}
        <span className="highlight">fantastic</span>
        <br />
        to have 
        {' '}
        <span className="highlight">you</span>
        {' '}
        here
      </h1>
      <p className={stylex.props(s.h1).className}>Have fun building your App with Qwik.</p>
    </div>
  )
})
