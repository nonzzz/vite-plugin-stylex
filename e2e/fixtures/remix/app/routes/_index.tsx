// eslint-disable-next-line @eslint-react/naming-convention/filename
import { useState } from 'react'
import type { MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' }
  ]
}

export default function Index() {
  const [color, setColor] = useState('red')

  return (
    <div>
      <h1 id="text" stylex={{ color }}>vite-plugin-stylex-dev</h1>
      <button type="button" onClick={() => setColor((pre) => pre === 'blue' ? 'red' : 'blue')}>Change color</button>
    </div>
  )
}
