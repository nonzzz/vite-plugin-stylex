import { lazy } from 'react'
import { defineEntries } from 'waku/server'
import { Slot } from 'waku/client'

const App = lazy(() => import('./components/app.js'))

export default defineEntries(
  // renderEntries
  async () => {
    return {
      App: <App />
    }
  },
  // getBuildConfig
  async () => [{ pathname: '/', entries: [{ input: '' }] }],
  // getSsrConfig
  async (pathname) => {
    switch (pathname) {
      case '/':
        return {
          input: '',
          body: <Slot id="App" />
        }
      default:
        return null
    }
  }
)
