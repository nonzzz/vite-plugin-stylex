import { css, html } from 'react-strict-dom'
import { Fragment } from 'react'
import Button from './button'

const egStyles = css.create({
  container: { borderTopWidth: 1 },
  h1: { padding: 10, backgroundColor: '#eee' },
  content: { padding: 10 },
  div: {
    paddingBottom: 50,
    paddingTop: 50,
    backgroundColor: 'white'
  }
})

function ExampleBlock() {
  return (
    <html.div style={egStyles.container}>
      <html.h1 style={egStyles.h1}>react-strict-dom</html.h1>
      <html.div style={egStyles.content}>Hello World</html.div>
    </html.div>
  )
}

function App() {
  return (
    <Fragment>
      <Button>123</Button>
      <ExampleBlock />
    </Fragment>
  )
}
export { App }
