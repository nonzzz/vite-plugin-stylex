import { defineEntries } from 'waku/server'
import App from './components/app'

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
    console.log(pathname)
    switch (pathname) {
      case '/':
        return {
          input: '',
          body: <App />
        }
      default:
        return null
    }
  }
)
