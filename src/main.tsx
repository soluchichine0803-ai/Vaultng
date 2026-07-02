import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="bottom-center"
      toastOptions={{
        style: {
          background: '#1A1A28',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: '13px',
          fontWeight: 600,
        }
      }}
    />
  </StrictMode>,
)
