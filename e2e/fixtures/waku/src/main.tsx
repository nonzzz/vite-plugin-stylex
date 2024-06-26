import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { Root } from 'waku/client'
import App from './components/app'
import 'virtual:stylex.css'

const rootElement = (
  <StrictMode>
    <Root>
      <App />
    </Root>
  </StrictMode>
)

if (import.meta.env.WAKU_HYDRATE) {
  hydrateRoot(document.body, rootElement)
} else {
  createRoot(document.body).render(rootElement)
}
