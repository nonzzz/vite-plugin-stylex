// eslint-disable-next-line @eslint-react/naming-convention/filename
import type { MetaFunction } from '@remix-run/node'
import { create, props } from '@stylexjs/stylex'
import { useState } from 'react'
import Card from '~/Card'

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' }
  ]
}

const styles = create({
  red: {
    color: 'lch(from red calc(l + 10%) c h)'
  },
  green: {
    color: 'lch(from green calc(l + 10%) c h)'
  }
})

export default function Index() {
  const [color, setColor] = useState('red')
  const handleClick = () => {
    setColor(pre => pre === 'red' ? 'green' : 'red')
  }
  return (
    <Card>
      Remix App with StyleX!
      <div {...props(color === 'red' ? styles.red : styles.green)} role="presentation" onClick={handleClick}>
        Hello Worlod
      </div>
    </Card>
  )
}
