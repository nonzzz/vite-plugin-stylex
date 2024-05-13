/* eslint-disable stylistic/jsx-one-expression-per-line */
import { create, props } from '@stylexjs/stylex'
import './init.css'
import '@stylex-dev.css'
import { ClientBanner } from './client-banner.js'

const styles = create({
  title: {
    fontSize: '16px',
    color: 'red'
  }
})

const App = ({ name }: { name: string }) => {
  return (
    <div style={{ border: '3px red dashed', margin: '1em', padding: '1em' }}>
      <title>Waku example</title>
      <h1 {...props(styles.title)}>Hello {name}</h1>
      <h3>This is a server component.</h3>
      <ClientBanner />
    </div>
  )
}

export default App
