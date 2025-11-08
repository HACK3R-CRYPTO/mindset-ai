import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import PrivyProviders from './context/PrivyProviders.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyProviders>
      <App />
    </PrivyProviders>
  </StrictMode>,
)
