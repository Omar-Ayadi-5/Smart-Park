import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import GlobalApiLoadingOverlay from './components/GlobalApiLoadingOverlay.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
      <App />
      <GlobalApiLoadingOverlay />
    </>
  </StrictMode>,
)
