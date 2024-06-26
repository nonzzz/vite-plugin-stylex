import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import 'virtual:stylex.css'

export function App() {
  const [color, setColor] = useState('red')

  return (
    <div>
      <h1 id="text" stylex={{ color }}>vite-plugin-stylex-dev</h1>
      <button type="button" onClick={() => setColor((pre) => pre === 'blue' ? 'red' : 'blue')}>Change color</button>
    </div>
  )
}

ReactDOM.createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
