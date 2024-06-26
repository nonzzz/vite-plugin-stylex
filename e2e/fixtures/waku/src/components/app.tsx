import { useState } from 'react'

const App = () => {
  const [color, setColor] = useState('red')

  return (
    <div>
      <h1 id="text" stylex={{ color }}>vite-plugin-stylex-dev</h1>
      <button type="button" onClick={() => setColor((pre) => pre === 'blue' ? 'red' : 'blue')}>Change color</button>
    </div>
  )
}

export default App
